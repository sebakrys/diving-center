package pl.sebakrys.diving.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;



@Configuration
public class WebConfig implements WebMvcConfigurer {


    @Value("${root.upload.path}")
    private String rootUploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absoluteUploadPath = Paths.get(rootUploadPath).toAbsolutePath().toString();

        // Konfiguracja serwowania zasobów statycznych z folderu uploads
        registry.addResourceHandler("/video/"+"**")
                .addResourceLocations("file:"+absoluteUploadPath+"/video/"); // Ścieżka do katalogu na video (DEMO)
        registry.addResourceHandler("/course_materials/"+"**")
                .addResourceLocations("file:"+absoluteUploadPath+"/course_materials/"); // Ścieżka do katalogu na pliki z kursów
    }
}

