// * ———————————————————————————————————————————————————————— * //
// * 	Enduro Admin login sessions
// * ———————————————————————————————————————————————————————— * //
var admin_sessions = function () {}

// vendor dependencies
var Promise = require('bluebird')
var moment = require('moment')

// local dependencies
var admin_security = require(ENDURO_FOLDER + '/libs/admin_utilities/admin_security')
var flat_file_handler = require(ENDURO_FOLDER + '/libs/flat_utilities/flat_file_handler')
var kiska_logger = require(ENDURO_FOLDER + '/libs/kiska_logger')

// constants
var SESSION_LIFETIME = 10 // in minutes

admin_sessions.prototype.create_session = function(req, user) {
	global.admin_sessions_store = global.admin_sessions_store || {}

	kiska_logger.timestamp('creating session for: ' + JSON.stringify(user), 'admin_login')

	session = {}
	session.success = true
	session.username = user.username
	session.sid = req.sessionID
	session.created = moment().unix()
	session.expires_at = moment().add(SESSION_LIFETIME, 'minutes').unix()

	global.admin_sessions_store[req.sessionID] = session

	return session
}

admin_sessions.prototype.get_user_by_session = function(sid) {
	global.admin_sessions_store = global.admin_sessions_store || {}

	kiska_logger.timestamp('getting user by session', 'admin_login')

	if(!(sid in global.admin_sessions_store)) {
		return new Promise(function(resolve, reject){ reject('session doesn\'t exist') })
	}

	if(global.admin_sessions_store[sid].expires_at < moment().unix()) {
		return new Promise(function(resolve, reject){ reject('session expired') })
	}

	// prolonge the session
	global.admin_sessions_store[sid].expires_at = moment().add(SESSION_LIFETIME, 'minutes').unix()

	return admin_security.get_user_by_username(global.admin_sessions_store[sid].username)
}

admin_sessions.prototype.logout_by_session = function(sid) {
	global.admin_sessions_store = global.admin_sessions_store || {}

	if(sid in global.admin_sessions_store) {
		delete global.admin_sessions_store[sid]
	}

	return true
}

module.exports = new admin_sessions()