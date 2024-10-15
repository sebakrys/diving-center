package pl.sebakrys.diving.blog.service;

import jakarta.annotation.PostConstruct;
import net.coobird.thumbnailator.Thumbnails;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pl.sebakrys.diving.blog.dto.BlogPostDto;
import pl.sebakrys.diving.blog.entity.BlogPost;
import pl.sebakrys.diving.blog.entity.BlogPostImage;
import pl.sebakrys.diving.blog.repo.BlogPostImageRepo;
import pl.sebakrys.diving.blog.repo.BlogPostRepo;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BlogService {

    @Value("${root.upload.path}")
    private String rootUploadPath;
    public static final String BLOG_IMAGES_ACCES_DIRECTORY = "/blog_images/";
    private String uploadPath;

    @Autowired
    private BlogPostRepo blogPostRepository;
    @Autowired
    private BlogPostImageRepo blogPostImageRepository;

    // Metoda wykonywana po wstrzyknięciu zależności i wartości
    @PostConstruct
    public void init() {
        uploadPath = rootUploadPath + BLOG_IMAGES_ACCES_DIRECTORY;
        createUploadDirectoryIfNotExists();  // Tworzenie katalogu po ustawieniu ścieżki
    }

    public void createUploadDirectoryIfNotExists(){

        System.out.println(uploadPath);
        Path uploadDirectory = Paths.get(uploadPath);

        // Upewnij się, że katalog istnieje, jeśli nie, stwórz go
        if (!Files.exists(uploadDirectory)) {
            try {
                Files.createDirectories(uploadDirectory);
            } catch (IOException e) {
                throw new RuntimeException("Nie można utworzyć katalogu dla plików!", e);
            }
        }
    }
    @Transactional
    public List<String> saveImages(List<MultipartFile> images) {
        List<String> urls = new ArrayList<>();

        for (MultipartFile image : images) {
            String filename = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path filePath = Paths.get(uploadPath, filename);

            try {
                // Zapisz oryginalny plik obrazu
                Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // Tworzenie miniaturki obrazu
                String thumbnailFilename = "thumb_" + filename;
                Path thumbnailPath = Paths.get(uploadPath, thumbnailFilename);

                // Tworzenie miniaturki za pomocą Thumbnailator
                Thumbnails.of(image.getInputStream())
                        .size(150, 150)  // Ustal rozmiar miniaturki
                        .toFile(thumbnailPath.toFile());

                // Zapisz oryginalny plik i miniaturkę w bazie danych
                BlogPostImage blogPostImage = new BlogPostImage();
                blogPostImage.setUrl(BLOG_IMAGES_ACCES_DIRECTORY + filename);  // Ścieżka do oryginalnego obrazu
                blogPostImage.setThumbnail_url(BLOG_IMAGES_ACCES_DIRECTORY + thumbnailFilename);  // Ścieżka do miniaturki
                blogPostImage.setCreatedAt(LocalDateTime.now());  // Ustaw czas przesłania

                blogPostImageRepository.save(blogPostImage);  // Zapisz obraz z postem ustawionym na null

                urls.add(blogPostImage.getUrl());  // Dodaj URL oryginalnego obrazu do listy
            } catch (IOException e) {
                throw new RuntimeException("Błąd podczas zapisu pliku", e);
            }
        }

        // Usuwanie starszych zdjęć bez przypisanego posta
        removeOldImages();

        return urls;
    }

    @Transactional
    public void removeOldImages() {
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        blogPostImageRepository.deleteByPostIsNullAndCreatedAtBefore(twentyFourHoursAgo);
    }

    @Transactional
    public BlogPost createPost(BlogPostDto postDto) {
        BlogPost post = new BlogPost();
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setPublishDate(LocalDateTime.now());

        BlogPost savedPost = blogPostRepository.save(post);

        // Przypisz obrazy do posta
        for (String imageUrl : postDto.getImages()) {
            Optional<BlogPostImage> optionalImage = blogPostImageRepository.findByUrl(imageUrl);
            if(optionalImage.isPresent()){
                BlogPostImage image = optionalImage.get();
                if (image.getPost() == null) {
                    image.setPost(savedPost);
                    blogPostImageRepository.save(image);  // Aktualizuj obrazek z przypisanym postem
                }
            }
        }

        return savedPost;
    }
}
