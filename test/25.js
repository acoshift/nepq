module.exports = {
  nepq: `read test { id, contact { name }, user { $ } }`,
  obj: {
    method: 'read',
    name: 'test',
    params: [],
    retrieves: {
      id: 1,
      contact: {
        name: 1
      },
      user: {
        $: 1
      }
    },
    $_: 1
  }
}
