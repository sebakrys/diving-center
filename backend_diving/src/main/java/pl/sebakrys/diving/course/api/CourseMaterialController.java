package pl.sebakrys.diving.course.api;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pl.sebakrys.diving.course.entity.CourseMaterial;
import pl.sebakrys.diving.course.service.CourseMaterialService;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/materials")
public class CourseMaterialController {

    @Autowired
    private CourseMaterialService courseMaterialService;

    @PostMapping("/upload/{type}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<Map<String, Object>> uploadMaterials(@RequestParam("file") List<MultipartFile> files,@RequestParam(value = "url",  required = false) List<String> urlList,@PathVariable String type) {
        List<String> urls;
        switch (type){
            case "FILE":
                urls = courseMaterialService.uploadMaterialFiles(files, urlList);
                break;
            case "VIDEO":
                urls = courseMaterialService.uploadMaterialVideo(files);
                break;
            case "IMAGE":
                urls = courseMaterialService.uploadMaterialImages(files, urlList);
                break;
            default:
                urls = courseMaterialService.uploadMaterialFiles(files, urlList);
                break;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("urls", urls);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{courseId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<CourseMaterial> addMaterial(@PathVariable Long courseId, @RequestBody CourseMaterial material) {
        CourseMaterial createdMaterial = courseMaterialService.addMaterial(courseId, material);
        return ResponseEntity.ok(createdMaterial);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseMaterial> getMaterialById(@PathVariable Long id, HttpServletRequest request) {
        Optional<CourseMaterial> material = courseMaterialService.getMaterialById(id, request);
        return material
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseMaterial>> getAllMaterialsForCourse(@PathVariable Long courseId, HttpServletRequest request) {
        List<CourseMaterial> materials = courseMaterialService.getMaterialsForCourse(courseId, request);
        return ResponseEntity.ok(materials);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<CourseMaterial> updateMaterial(@PathVariable Long id, @RequestBody CourseMaterial material) {
        CourseMaterial updatedMaterial = courseMaterialService.updateMaterial(id, material);
        return ResponseEntity.ok(updatedMaterial);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        courseMaterialService.deleteMaterial(id);
        return ResponseEntity.ok().build();
    }
}

