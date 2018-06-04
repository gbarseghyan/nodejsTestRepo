'use strict'

// TODO:
// lock1 - if state locked - throw
// lock2 - if state locked - retry

const assert = require('assert')
const lock1 = require('./lock1')
const lock2 = require('./lock2')

let state = 0
const errors = []

const onError = (err) => {
  errors.push(err.message)
}

const assertState = (v) => {
  assert(state === v)
  assert(errors.length === 1 && errors[0] === 'state locked')
}

const getState = async () => {
  return state
}

const setState = async (v) => {
  state = v
}

const increment = async (v) => {
  const v1 = await getState()
  const v2 = v1 + v
  await setState(v2)
}

const withLock1 = lock1(increment)
const withLock2 = lock2(increment)

withLock1('state', 1).catch(onError)
withLock1('state', 2).catch(onError)
setTimeout(() => {
  assertState(1)
  withLock2('state', 2).catch(onError)
  withLock2('state', 3).catch(onError)
  setTimeout(() => {
    assertState(6)
  }, 20)
}, 20)
