package pl.sebakrys.diving.page_content.repo;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.course.entity.CourseMaterial;
import pl.sebakrys.diving.page_content.entity.PageContent;

@Repository
public interface PageContentRepo extends JpaRepository<PageContent, Long> {
}
