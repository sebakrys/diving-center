package pl.sebakrys.diving.course.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Map<String, Object>> uploadMaterials(@RequestParam("file") List<MultipartFile> files, @PathVariable String type) {
        List<String> urls;
        switch (type){
            case "FILE":
                urls = courseMaterialService.uploadMaterialFiles(files);
                break;
            case "VIDEO":
                urls = courseMaterialService.uploadMaterialVideo(files);
                break;
            default:
                urls = courseMaterialService.uploadMaterialFiles(files);
                break;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("urls", urls);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{courseId}")
    public ResponseEntity<CourseMaterial> addMaterial(@PathVariable Long courseId, @RequestBody CourseMaterial material) {
        CourseMaterial createdMaterial = courseMaterialService.addMaterial(courseId, material);
        return ResponseEntity.ok(createdMaterial);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseMaterial> getMaterialById(@PathVariable Long id) {
        Optional<CourseMaterial> material = courseMaterialService.getMaterialById(id);
        return material
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseMaterial>> getAllMaterialsForCourse(@PathVariable Long courseId) {
        List<CourseMaterial> materials = courseMaterialService.getMaterialsForCourse(courseId);
        return ResponseEntity.ok(materials);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseMaterial> updateMaterial(@PathVariable Long id, @RequestBody CourseMaterial material) {
        CourseMaterial updatedMaterial = courseMaterialService.updateMaterial(id, material);
        return ResponseEntity.ok(updatedMaterial);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        courseMaterialService.deleteMaterial(id);
        return ResponseEntity.ok().build();
    }
}

