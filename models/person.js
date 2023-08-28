const mongoose = require('mongoose')

const mongoURL = process.env.MONGODB_URI

console.log(`connecting to ${mongoURL}`)

mongoose
	.connect(mongoURL)
	.then(result => {
		console.log('Connected to the database')
	})
	.catch(error => {
		console.log(`error connecting to the database: ${error}`)
	})

const personSchema = new mongoose.Schema({
	name: {
		type: String,
		minlength: [3, 'Name has to be at least 3 letters long'],
		required: true,
		unique: true,
	},
	number: {
		type: String,
		minlength: [8, 'Phone number has to be at least 8 numbers long'],
		validate: {
			validator: function (v) {
				return /^[0-9]{2,3}-[0-9]/.test(v)
			},
			message: `This is not a valid phone number, pattern is: xxx-xxxxxxxxx`,
		},
		required: true,
		unique: true,
	},
})

personSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	},
})

module.exports = mongoose.model('Person', personSchema)
