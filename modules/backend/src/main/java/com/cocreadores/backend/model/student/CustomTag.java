package com.cocreadores.backend.model.student;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "custom_tags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CustomTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String color;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean enabled = true;

    @Column(name = "important", nullable = false)
    private boolean important;

    @Column(name = "dark", nullable = false)
    private boolean dark;

    @JsonIgnore
    @ManyToMany(mappedBy = "customTags", fetch = FetchType.LAZY)
    private Set<StudentConversationEntity> studentConversations;

    @Enumerated(EnumType.STRING)
    @Column(name = "student_tag")
    private StudentType studentTag;
}