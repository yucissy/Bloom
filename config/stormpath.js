var stormpath = require('stormpath');

function Stormpath() {

	var apiKey = new stormpath.ApiKey(
	  process.env['STORMPATH_CLIENT_APIKEY_ID'],
	  process.env['STORMPATH_CLIENT_APIKEY_SECRET']
	);

	var client = new stormpath.Client({ apiKey: apiKey });

	var applicationHref = process.env['STORMPATH_APPLICATION_HREF'];

	this.createAccount = function(fName, lName, uID, em, pass) {
		client.getApplication(applicationHref, function(err, application) {
			var account = {
				givenName: fName,
				surname: lName,
				username: uID,
				email: em,
				password: pass
		    };

		    application.createAccount(account, function(err, createdAccount) {
				console.log('Account:', createdAccount);
			});
		});
	}

	// client.getApplication(applicationHref, function(err, application) {
	    // var account = {
	    //   givenName: 'Joe',
	    //   surname: 'Stormtrooper',
	    //   username: 'B010001231',
	    //   email: 'mlee4242@gmail.com',
	    //   password: 'appleOrange1' //must include a capital letter, a number, and be 8 characters long
	    // };

	    // application.createAccount(account, function(err, createdAccount) {
	    //   console.log('Account:', err);
	    // });

	    /*application.getAccounts({ email: 'mlee4242@gmail.com' }, function(err, accounts) {
	      accounts.each(function(account, callback) {
	        console.log('Account:', account);
	        callback();
	      }, function(err) {
	        console.log('Finished iterating over accounts.');
	      });
	    }); */

	//     var authRequest = {
	//       username: 'B010001231',
	//       password: 'appleOrange1'
	//     };

	//     application.authenticateAccount(authRequest, function(err, result) {
	//       // If successful, the authentication result will have a method,
	//       // getAccount(), for getting the authenticated account.
	//       result.getAccount(function(err, account) {
	//         console.log('Account:', account);
	//       });
	//     });
	// });
}

module.exports = Stormpath;
