package repository

import (
	"bolgweb/internal/model"

	"gorm.io/gorm"
)

// UserRepository handles database operations for users.
type UserRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new UserRepository.
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create inserts a new user.
func (r *UserRepository) Create(user *model.User) error {
	return r.db.Create(user).Error
}

// FindByEmail finds a user by email.
func (r *UserRepository) FindByEmail(email string) (*model.User, error) {
	var user model.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByID finds a user by ID.
func (r *UserRepository) FindByID(id uint) (*model.User, error) {
	var user model.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// HasAdmin checks if any admin user exists.
func (r *UserRepository) HasAdmin() (bool, error) {
	var count int64
	err := r.db.Model(&model.User{}).Where("role = ?", model.RoleAdmin).Count(&count).Error
	return count > 0, err
}

// AutoMigrate runs GORM auto-migration for the User model.
func (r *UserRepository) AutoMigrate() error {
	return r.db.AutoMigrate(&model.User{})
}
