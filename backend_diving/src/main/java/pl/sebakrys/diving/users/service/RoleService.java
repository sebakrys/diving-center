package pl.sebakrys.diving.users.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pl.sebakrys.diving.users.entity.Role;
import pl.sebakrys.diving.users.repo.RoleRepo;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService {

    private final RoleRepo roleRepo;

    @Autowired
    public RoleService(RoleRepo roleRepo) {
        this.roleRepo = roleRepo;
    }

    // Dodanie nowej roli
    public Role addRole(Role role) {
        return roleRepo.save(role);
    }

    // Pobranie roli po ID
    public Optional<Role> getRoleById(Long roleId) {
        return roleRepo.findById(roleId);
    }

    // Pobranie wszystkich ról
    public List<Role> getAllRoles() {
        return roleRepo.findAll();
    }

    // Aktualizacja roli
    public Optional<Role> updateRole(Long roleId, Role roleDetails) {
        return roleRepo.findById(roleId)
                .map(role -> {
                    role.setName(roleDetails.getName());
                    return roleRepo.save(role);
                });
    }

    // Usunięcie roli
    public void deleteRole(Long roleId) {
        roleRepo.deleteById(roleId);
    }
}
