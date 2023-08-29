const mongoose = require('mongoose')

if (process.argv.length < 3) {
	console.log('No password as an argument')
	process.exit(1)
}

const url = `mongodb+srv://phonebook:${process.argv[2]}@phonebook.x6x4k0o.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
	name: String,
	number: Number,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
	name: process.argv[3],
	number: process.argv[4],
})

if (process.argv[3] && process.argv[4]) {
	person.save().then(() => {
		console.log(`Added ${person.name} with number ${person.number}`)
		mongoose.connection.close()
	})
} else if (process.argv.length === 3) {
	Person.find({}).then(result => {
		result.forEach(person => {
			console.log(`${person.name} - ${person.number}`)
		})
		mongoose.connection.close()
	})
}
