package pl.sebakrys.diving.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import pl.sebakrys.diving.users.entity.Role;
import pl.sebakrys.diving.users.repo.RoleRepo;

@Component
public class RoleInitializer implements CommandLineRunner {

    private final RoleRepo roleRepo;

    public RoleInitializer(RoleRepo roleRepo) {
        this.roleRepo = roleRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        createRoleIfNotExists("ROLE_ADMIN");
        createRoleIfNotExists("ROLE_EMPLOYEE");
        createRoleIfNotExists("ROLE_CLIENT");
    }

    private void createRoleIfNotExists(String roleName) {
        roleRepo.findByName(roleName).orElseGet(() -> {
            Role role = new Role();
            role.setName(roleName);
            return roleRepo.save(role);
        });
    }
}

