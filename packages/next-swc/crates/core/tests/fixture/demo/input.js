import doSomething from 'some-library';

export function someExpectedExport() {
	return doSomething('some input')
}

export function anotherExpectedExport() {
	return doSomething('different input')
}

function randomCode() {
	let doSomething = () => console.log('yo')
	doSomething()
}