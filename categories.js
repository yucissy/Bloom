function Category(db) {

	this.makeNewCategory = function(user, categoryId, categoryName, subCategories, studyTips, callback) {
		db.isUserStudentById(user, function(result, person) {
			if (person == null) {
				callback(person, result);
			} else if (!result) {
				db.insertCategory(categoryId, user, categoryName, subCategories, studyTips, callback);
			}
		});
	}

	this.isCategoryValid = function(categoryId, callback) {
		db.checkIfNewCategoryIdIsValid(categoryId, callback);
	}

	this.getStudyTipsForCategory = function(categoryId, callback) {
		db.findStudyTipsForCategory(categoryId, callback);
	}

	this.getCategoriesForProfessor = function(userId, callback) {
		db.isUserStudentById (userId, function(result, person) {
			if (person == null) {
				callback(person, result);
			} else if (!result) {
				db.findCategoriesForProfessor(userId, callback);
			}
		});
	}
}

module.exports = Category;