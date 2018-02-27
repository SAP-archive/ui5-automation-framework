  exports.authConfigs={
    'plain': {
      name: './authenticator/plainAuthenticator'
    },
    'basic': {
      name: './authenticator/basicUrlAuthenticator'
    },
    'fiori-form': {
      name: './authenticator/formAuthenticator',
      userFieldSelector: '#USERNAME_FIELD input',
      passFieldSelector: '#PASSWORD_FIELD input',
      logonButtonSelector: '#LOGIN_LINK'
    },
    'sapcloud-form': {
      name: './authenticator/formAuthenticator',
      userFieldSelector: '#j_username',
      passFieldSelector: '#j_password',
      logonButtonSelector: '#logOnFormSubmit'
    },
	'XSA-form': {
      name: './authenticator/formAuthenticator',
      userFieldSelector: '#xs_username-inner',
      passFieldSelector: '#xs_password-inner',
      logonButtonSelector: '#logon_button'
    },
	'POT-form': {
      name: './authenticator/formAuthenticator',
      userFieldSelector: '#__screen0-user',
      passFieldSelector: '#__screen0-pass',
      logonButtonSelector: '#__screen0-loginBtn'
    },
	'MIA-form': {
      name: './authenticator/formAuthenticator',
      userFieldSelector: '#logonuidfield',
      passFieldSelector: '#logonpassfield',
      logonButtonSelector: '.urBtnStdNew'
    },
	'UI5-Form' : {
		name : './authenticator/formAuthenticator',
		userFieldSelector : '#__control0-user-inner',
		passFieldSelector : '#__control0-pass-inner',
		logonButtonSelector : '#__control0-logonBtn'
	}
 };
 
 
 
 
 
 
 
 
 
 
 