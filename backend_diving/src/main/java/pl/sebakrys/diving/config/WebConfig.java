package pl.sebakrys.diving.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

import static pl.sebakrys.diving.blog.service.BlogService.BLOG_IMAGES_ACCES_DIRECTORY;
import static pl.sebakrys.diving.page_content.service.FilesService.IMAGES_ACCES_DIRECTORY;
import static pl.sebakrys.diving.page_content.service.FilesService.PAGES_ACCES_DIRECTORY;

@Configuration
public class WebConfig implements WebMvcConfigurer {


    @Value("${root.upload.path}")
    private String rootUploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absoluteUploadPath = Paths.get(rootUploadPath).toAbsolutePath().toString();

        // Konfiguracja serwowania zasobów statycznych z folderu uploads
        registry.addResourceHandler(BLOG_IMAGES_ACCES_DIRECTORY+"**")
                .addResourceLocations("file:"+absoluteUploadPath+BLOG_IMAGES_ACCES_DIRECTORY); // Ścieżka do katalogu na pliki

        registry.addResourceHandler(PAGES_ACCES_DIRECTORY+"**")
                .addResourceLocations("file:"+absoluteUploadPath+PAGES_ACCES_DIRECTORY); // Ścieżka do katalogu na pliki
        registry.addResourceHandler(IMAGES_ACCES_DIRECTORY+"**")
                .addResourceLocations("file:"+absoluteUploadPath+IMAGES_ACCES_DIRECTORY); // Ścieżka do katalogu na pliki


        registry.addResourceHandler("/video/"+"**")
                .addResourceLocations("file:"+absoluteUploadPath+"/video/"); // Ścieżka do katalogu na video (DEMO)
        registry.addResourceHandler("/course_materials/"+"**")
                .addResourceLocations("file:"+absoluteUploadPath+"/course_materials/"); // Ścieżka do katalogu na pliki z kursów
    }
}

