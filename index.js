require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Person = require('./models/person')
const morgan = require('morgan')

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())

morgan.token('reqBody', function (req) {
	if (req.method === 'POST') {
		return JSON.stringify(req.body)
	}
})

app.use(
	morgan(
		':method :url :status :res[content-length] - :response-time ms :reqBody'
	)
)

app.get('/api/persons', (req, res, next) => {
	Person.find({})
		.then(people => {
			res.json(people)
		})
		.catch(error => next(error))
})

app.get('/info', (req, res, next) => {
	const currentTime = new Date()
	Person.find({})
		.then(people => {
			res.send(
				`<p>Phonebook has ${people.length} numbers</p>
				<p>${currentTime}</p>`
			)
		})
		.catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
	Person.findById(req.params.id)
		.then(person => {
			if (person) {
				res.json(person)
			} else {
				res.status(404).end()
			}
		})
		.catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
	const body = req.body
	if (!body.name || !body.number) {
		return res.status(400).json({
			error: 'Content missing',
		})
	}

	const person = new Person({
		name: body.name,
		number: body.number,
	})

	person
		.save()
		.then(savedPerson => {
			res.json(savedPerson)
		})
		.catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
	Person.findByIdAndRemove(request.params.id)
		.then(() => {
			response.status(204).end()
		})
		.catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}

app.put('/api/persons/:id', (request, response, next) => {
	const { name, number } = request.body

	Person.findByIdAndUpdate(
		request.params.id,
		{ name, number },
		{
			new: true,
			runValidators: true,
			context: 'query',
		}
	)
		.then(updatedPerson => {
			response.json(updatedPerson)
		})
		.catch(error => next(error))
})

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
	console.error(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	}

	next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
