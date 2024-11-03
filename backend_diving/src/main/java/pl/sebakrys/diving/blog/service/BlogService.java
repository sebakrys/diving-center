package pl.sebakrys.diving.blog.service;

import jakarta.annotation.PostConstruct;
import net.coobird.thumbnailator.Thumbnails;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pl.sebakrys.diving.GoogleCloudStorage.InMemoryMultipartFile;
import pl.sebakrys.diving.GoogleCloudStorage.service.GcsService;
import pl.sebakrys.diving.blog.dto.BlogPostDto;
import pl.sebakrys.diving.blog.entity.BlogPost;
import pl.sebakrys.diving.blog.entity.BlogPostImage;
import pl.sebakrys.diving.blog.repo.BlogPostImageRepo;
import pl.sebakrys.diving.blog.repo.BlogPostRepo;
import pl.sebakrys.diving.users.entity.User;
import pl.sebakrys.diving.users.repo.UserRepo;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class BlogService {

    @Value("${spring.cloud.gcp.storage.bucket}")
    private String gcsBucketName; // Dodane

    public static final String BLOG_IMAGES_ACCESS_DIRECTORY = "blog_images/"; // Zmieniono na URL-friendly path

    @Autowired
    private BlogPostRepo blogPostRepository;
    @Autowired
    private BlogPostImageRepo blogPostImageRepository;
    @Autowired
    private UserRepo userRepo;

    @Autowired
    private GcsService gcsService; // Dodane

    // Metoda wykonywana po wstrzyknięciu zależności i wartości
    @PostConstruct
    public void init() {
        // Usunięto inicjalizację lokalnego katalogu upload_directory
    }

    /**
     * Przesyła obrazy do GCS, tworzy miniaturki i generuje podpisane URL-e.
     *
     * @param images Lista MultipartFile z obrazami do przesłania.
     * @return Lista podpisanych URL-i oryginalnych obrazów.
     */
    @Transactional
    public List<String> saveImages(List<MultipartFile> images) {
        List<String> signedUrls = new ArrayList<>();
        List<String> gcsUrls = new ArrayList<>();

        for (MultipartFile image : images) {
            try {
                // Przesyłanie oryginalnego pliku obrazu do GCS
                String url = gcsService.uploadFile(image);
                String filename = extractFilenameFromUrl(url);

                // Tworzenie miniaturki obrazu
                String thumbnailFilename = "thumb_" + filename;
                MultipartFile thumbnailFile = createThumbnail(image, thumbnailFilename);

                // Przesyłanie miniaturki do GCS
                String thumbnailUrl = gcsService.uploadFile(thumbnailFile);

                // Generowanie podpisanych URL-i
                URL signedUrl = gcsService.generateSignedUrlForDownload(filename, 60, TimeUnit.MINUTES); // 60 minut
                URL signedThumbnailUrl = gcsService.generateSignedUrlForDownload(thumbnailFilename, 60, TimeUnit.MINUTES); // 60 minut

                // Zapisz oryginalny plik i miniaturkę w bazie danych
                BlogPostImage blogPostImage = new BlogPostImage();
                blogPostImage.setUrl(url); // URL oryginalnego obrazu
                gcsUrls.add(url);
                System.err.println(url);
                blogPostImage.setThumbnail_url(thumbnailUrl.toString()); // URL miniaturki
                blogPostImage.setCreatedAt(LocalDateTime.now()); // Ustaw czas przesłania

                blogPostImageRepository.save(blogPostImage); // Zapisz obraz z postem ustawionym na null

                signedUrls.add(signedUrl.toString()); // Dodaj podpisany URL oryginalnego obrazu do listy
                signedUrls.add(signedThumbnailUrl.toString()); // Dodaj podpisany URL miniaturki do listy
                return gcsUrls;
            } catch (IOException e) {
                throw new RuntimeException("Błąd podczas zapisu pliku", e);
            }
        }

        // Usuwanie starszych zdjęć bez przypisanego posta
        removeOldImages();

        return signedUrls;
    }

    /**
     * Tworzy miniaturkę z MultipartFile.
     *
     * @param image          Oryginalny plik obrazu.
     * @param thumbnailName Nazwa miniaturki.
     * @return MultipartFile reprezentujący miniaturkę.
     * @throws IOException Jeśli wystąpi błąd podczas tworzenia miniaturki.
     */
    private MultipartFile createThumbnail(MultipartFile image, String thumbnailName) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Thumbnails.of(image.getInputStream())
                .size(150, 150) // Ustal rozmiar miniaturki
                .toOutputStream(baos); // Zapisz do ByteArrayOutputStream
        byte[] thumbnailBytes = baos.toByteArray();

        return new InMemoryMultipartFile(thumbnailName, thumbnailName, image.getContentType(), thumbnailBytes);
    }

    /**
     * Ekstrahuje nazwę pliku z URL.
     *
     * @param url URL pliku w GCS.
     * @return Nazwa pliku.
     */
    private String extractFilenameFromUrl(String url) {
        return url.substring(url.lastIndexOf("/") + 1);
    }

    @Transactional
    public void removeOldImages() {
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        blogPostImageRepository.deleteByPostIsNullAndCreatedAtBefore(twentyFourHoursAgo);
    }

    /**
     * Tworzy nowy post na blogu i przypisuje do niego obrazy.
     *
     * @param postDto DTO zawierające dane postu.
     * @return Zapisany obiekt BlogPost.
     */
    @Transactional
    public BlogPost createPost(BlogPostDto postDto) {
        BlogPost post = new BlogPost();

        if (postDto.getTitle().length() > 255) {
            throw new IllegalArgumentException("Title is too long, it must be less than 255 characters.");
        }

        if (postDto.getContent().length() > 3500) {
            throw new IllegalArgumentException("Content is too long, it must be less than 3500 characters.");
        }

        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());

        User author = userRepo.findByUuid(postDto.getUserUUID())
                .orElse(null);
        post.setAuthor(author);

        post.setPublishDate(LocalDateTime.now());

        BlogPost savedPost = blogPostRepository.save(post);

        // Przypisz obrazy do posta
        for (String imageUrl : postDto.getImages()) {
            Optional<BlogPostImage> optionalImage = blogPostImageRepository.findByUrl(imageUrl);
            if (optionalImage.isPresent()) {
                BlogPostImage image = optionalImage.get();
                if (image.getPost() == null) {
                    image.setPost(savedPost);
                    blogPostImageRepository.save(image); // Aktualizuj obrazek z przypisanym postem
                }
            }
        }

        return savedPost;
    }

    /**
     * Edytuje istniejący post na blogu i aktualizuje przypisane do niego obrazy.
     *
     * @param postDto DTO zawierające nowe dane postu.
     * @param postId  ID postu do edycji.
     * @return Zaktualizowany obiekt BlogPost.
     */
    @Transactional
    public BlogPost editPost(BlogPostDto postDto, Long postId) {
        Optional<BlogPost> postOptional = blogPostRepository.findById(postId);

        if (postOptional.isEmpty()) return null;
        BlogPost post = postOptional.get();

        if (postDto.getTitle().length() > 255) {
            throw new IllegalArgumentException("Title is too long, it must be less than 255 characters.");
        }

        if (postDto.getContent().length() > 3500) {
            throw new IllegalArgumentException("Content is too long, it must be less than 3500 characters.");
        }

        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());

        User author = userRepo.findByUuid(postDto.getUserUUID())
                .orElse(null);
        post.setAuthor(author);

        // Nie zmieniaj daty publikacji

        // Usuń obrazy z posta
        for (BlogPostImage image : post.getImages()) {
            image.setPost(null);
            blogPostImageRepository.save(image);
        }

        post.getImages().clear();

        // Przypisz nowe obrazy do posta
        for (String imageUrl : postDto.getImages()) {
            Optional<BlogPostImage> optionalImage = blogPostImageRepository.findByUrl(imageUrl);
            if (optionalImage.isPresent()) {
                BlogPostImage image = optionalImage.get();
                image.setPost(post);
                blogPostImageRepository.save(image); // Aktualizuj obrazek z przypisanym postem
            }
        }

        BlogPost savedPost = blogPostRepository.save(post);

        return savedPost;
    }

    /**
     * Usuwa post na blogu wraz z przypisanymi do niego obrazami.
     *
     * @param postId ID postu do usunięcia.
     * @return Usunięty obiekt BlogPost.
     */
    @Transactional
    public BlogPost deleteBlogPosts(Long postId) {
        Optional<BlogPost> postOptional = blogPostRepository.findById(postId);

        if (postOptional.isEmpty()) return null;
        BlogPost post = postOptional.get();

        // Usunięcie obrazów z GCS
        for (BlogPostImage image : post.getImages()) {
            gcsService.deleteFile(extractFilenameFromUrl(image.getUrl()));
            gcsService.deleteFile(extractFilenameFromUrl(image.getThumbnail_url()));
            blogPostImageRepository.delete(image);
        }

        blogPostRepository.delete(post);

        return post;
    }

    /**
     * Pobiera post na blogu na podstawie ID.
     *
     * @param postId ID postu.
     * @return Opcjonalny obiekt BlogPost.
     */
    public Optional<BlogPost> getBlogPost(Long postId) {
        Optional<BlogPost> blogPostOptional = blogPostRepository.findById(postId);

        if (blogPostOptional.isPresent()) {
            BlogPost blogPost = blogPostOptional.get();
            blogPost.getImages().forEach(bpi -> {
                URL signedUrl = gcsService.generateSignedUrlForDownload(extractFilenameFromUrl(bpi.getUrl()), 60, TimeUnit.MINUTES);
                URL signedThumbnailUrl = gcsService.generateSignedUrlForDownload(extractFilenameFromUrl(bpi.getThumbnail_url()), 60, TimeUnit.MINUTES);
                bpi.setUrl(signedUrl.toString());
                bpi.setThumbnail_url(signedThumbnailUrl.toString());
            });
            return Optional.of(blogPost);
        }

        return blogPostOptional;
    }

    /**
     * Pobiera wszystkie posty na blogu posortowane malejąco po ID i generuje podpisane URL-e dla obrazów.
     *
     * @return Lista obiektów BlogPost.
     */
    public List<BlogPost> getAllBlogPosts() {
        List<BlogPost> blogPostList = blogPostRepository.findAllByOrderByIdDesc();

        blogPostList.forEach(blogPost ->
                blogPost.getImages().forEach(bpi -> {
                    URL signedUrl = gcsService.generateSignedUrlForDownload(extractFilenameFromUrl(bpi.getUrl()), 60, TimeUnit.MINUTES);
                    URL signedThumbnailUrl = gcsService.generateSignedUrlForDownload(extractFilenameFromUrl(bpi.getThumbnail_url()), 60, TimeUnit.MINUTES);
                    bpi.setUrl(signedUrl.toString());
                    bpi.setThumbnail_url(signedThumbnailUrl.toString());
                })
        );

        return blogPostList;
    }
}
