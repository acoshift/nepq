module.exports = {
  nepq: `
update user(user: "user1", _: {
	"password": "new_password",
	"enabled": false,
	"age": 3,
	"array": [ "e1", "e2", 4, 6, false, true, null ],
	"mynull": null,
	"sub": {
		"a": 1,
		"sub": {
			"sub": {
				"a": [
					{ "b": 1, "c": 4 },
					{ "b": 2, "c": 1 }
				]
			}
		}
	}
})
  `,
  obj: {
    "method": "update",
    "namespace": [],
    "name": "user",
    "param": {
      "user": "user1",
      "_": {
        "password": "new_password",
        "enabled": false,
        "age": 3,
        "array": [
          "e1",
          "e2",
          4,
          6,
          false,
          true,
          null
        ],
        "mynull": null,
        "sub": {
          "a": 1,
          "sub": {
            "sub": {
              "a": [
                {
                  "b": 1,
                  "c": 4
                },
                {
                  "b": 2,
                  "c": 1
                }
              ]
            }
          }
        }
      }
    },
    "retrieve": null
  }
}
