function Category(db) {

	this.makeNewCategory = function(user, categoryId, categoryName, subCategories, studyTips, callback) {
		db.isUserStudentById(user, function(result, person) {
			if (!result) {
				db.insertCategory(categoryId, user, categoryName, subCategories, studyTips, callback);
			}
		});
	}

	this.isCategoryValid = function(categoryId, callback) {
		db.doesCategoryExist(categoryId, function(exists) {
			var message;
			if (exists) {
				message = "This ID already exists. Please try a different ID.";
			} else {
				message = "success";
			}
			callback(message);
		});
	}

	this.getStudyTipsForCategory = function(categoryId, callback) {
		db.findStudyTipsForCategory(categoryId, callback);
	}

	this.getCategoriesForProfessor = function(userId, callback) {
		db.isUserStudentById (userId, function(result, person) {
			if (!result) {
				db.findCategoriesForProfessor(userId, callback);
			}
		});
	}
}

module.exports = Category;