package pl.sebakrys.diving.page_content.api;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import pl.sebakrys.diving.page_content.entity.PageContent;
import pl.sebakrys.diving.page_content.repo.PageContentRepo;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin // for React and API
@RestController
@RequestMapping("/page_content") // Wspólna ścieżka dla endpointów
public class PageContentController {

    @Autowired
    private PageContentRepo pageContentRepository;

    @PostMapping("/")
    public void addPageContent(@RequestBody Map<String, Object> payload) {
        String content = (String) payload.get("content");
        PageContent pageContent = new PageContent();
        pageContent.setContent(content);
        pageContentRepository.save(pageContent);
    }

    @GetMapping("/")
    public Map<String, Object> loadPageContent() {
        Optional<PageContent> pageContent = pageContentRepository.findById(1L); // Przykładowy rekord
        Map<String, Object> response = new HashMap<>();
        response.put("content", pageContent.isPresent() ? pageContent.get().getContent() : "{}");
        return response;
    }
}
