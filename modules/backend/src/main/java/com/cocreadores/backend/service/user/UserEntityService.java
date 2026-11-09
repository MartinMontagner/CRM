package com.cocreadores.backend.service.user;

import com.cocreadores.backend.dto.user.UserDTO;
import com.cocreadores.backend.dto.user.UserResponseDTO;
import com.cocreadores.backend.dto.user.UserUpdateDTO;
import com.cocreadores.backend.dto.user.UserUpdateRoleDTO;
import com.cocreadores.backend.exception.AuthenticationException;
import com.cocreadores.backend.exception.NotFoundException;
import com.cocreadores.backend.exception.UnauthorizedException;
import com.cocreadores.backend.model.user.CustomUserDetails;
import com.cocreadores.backend.model.user.RefreshTokenEntity;
import com.cocreadores.backend.model.user.Role;
import com.cocreadores.backend.model.user.Role.RoleDescription;
import com.cocreadores.backend.model.user.UserEntity;
import com.cocreadores.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserEntityService implements UserDetailsService {

    private final UserRepository userRepository;

    public UserEntityService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username).map(CustomUserDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException(username));
    }

    @Transactional(readOnly = true)
    public Optional<UserEntity> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    public UserEntity saveOrUpdate(UserEntity userEntity) {
        return userRepository.save(userEntity);
    }

    public List<RoleDescription> getRoles() throws AuthenticationException {
        return Role.getRolesWithDescriptions();
    }

    @Transactional(readOnly = true)
    public UserEntity findById(long userId) throws NotFoundException {
        return userRepository.findById(userId).orElseThrow(() -> new NotFoundException("USER_NOT_FOUND"));
    }
    private int roleImportance(Role role) {
        return switch (role) {
            case SUPER_ADMIN -> 0;
            case ADMIN -> 1;
            case COACH_HEBREO -> 2;
            case COACH_MENTORIA -> 3;
            case VENTAS -> 4;
            case USER -> 5;
            default -> 100;
        };
    }
    private Role getMostImportantRole(UserEntity user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return null;
        }
        return user.getRoles().stream()
                .min(Comparator.comparingInt(this::roleImportance))
                .orElse(null);
    }
    public List<UserUpdateRoleDTO> getAll(Long userId) {
        List<UserEntity> all = userRepository.findAllByEnabledTrueAndApprovedAtIsNotNull();
        return all.stream()
                .filter(user -> !user.getId().equals(userId))
                .map(user -> new UserUpdateRoleDTO(user, getMostImportantRole(user)))
                .collect(Collectors.toList());
    }

    public UserDetails getUser(Long userId) throws NotFoundException {
        return userRepository.findById(userId).map(CustomUserDetails::new)
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND"));
    }

    public String getUserName(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("USER_NOT_FOUND"));
        return user.getName();
    }

    @Transactional(readOnly = true)
    public List<UserEntity> getUnapprovedUsers() {
        return userRepository.findByEnabledFalse();
    }

    public void enableUser(Long userId, Role role) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("USER_NOT_FOUND"));

        user.setEnabled(role);
        userRepository.save(user);
    }

    public UserDTO getUserDto(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("USER_NOT_FOUND"));

        UserDTO userDTO = new UserDTO(user);

        return userDTO;
    }
    @Transactional
    public UserResponseDTO updateUserRole(Long id, UserUpdateDTO userUpdateDTO) throws NotFoundException, UnauthorizedException {
        if ( userUpdateDTO.role() == Role.SUPER_ADMIN){
            throw new UnauthorizedException("SUPER_ADMIN_ROLE_NOT_ALLOWED");
        }
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND"));

        user.updateRole(userUpdateDTO.role());
        userRepository.save(user);

        return new UserResponseDTO(user);
    }

    @Transactional(readOnly = true)
    public Optional<UserEntity> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional(readOnly = true)
    public Optional<UserEntity> findByName(String name) { return userRepository.findByName(name);}

    public Map<String, Integer> getCountAprovedUsersToday() {
        Optional<Long> countAprovedUsersToday = userRepository.getCountAprovedUsersToday();
        Long count = countAprovedUsersToday.orElse(0L);
        Map<String, Integer> map = Map.of("count", count.intValue());
        return map;
    }
    @Transactional
    public void toggleUserStatus(Long userId) throws NotFoundException {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND"));

        user.setDisabled(!user.isDisabled());
        userRepository.save(user);
    }

    @Transactional
    public void disableUser(Long userId) throws NotFoundException {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND"));

        user.setDisabled(true);
        userRepository.save(user);
    }

    @Transactional
    public void enableUserAccount(Long userId) throws NotFoundException {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND"));

        user.setDisabled(false);
        userRepository.save(user);
    }
}