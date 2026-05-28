const API = {
  SOFTWARE: {
    GET: {
      ALL: "/api/software",
      BY_ID: "/api/software/:id",
    },
    POST: {
      ALL: "/api/software",
    },
    PUT: {
      BY_ID: "/api/software/:id",
    },
    DELETE: {
      BY_ID: "/api/software/:id",
    },
  },
  LICENSE: {
    GET: {
      ALL: "/api/licenses",
      BY_ID: "/api/licenses/:id",
      AVAILABLE_ALL: "/api/licenses/available/all",
      AVAILABLE_BY_ID: "/licenses/available",
    },
    POST: {
      ALL: "/api/licenses",
      MULTIPLE: "/api/licenses-bulk",
      MULTIPLE_DELETE: "/api/licenses/delete-multiple",
    },
    PUT: {
      BY_ID: "/api/licenses/:id",
      MULTIPLE: "/api/licenses-bulk",
    },
    DELETE: {
      BY_ID: "/api/licenses/:id",
    },
  },
  SOFTWARE_VERSION: {
    GET: {
      ALL: "/api/software-versions",
      BY_ID: "/api/software-versions/:id",
      BY_SOFTWARE_ID: "/api/software-versions/:software_id/versions",
    },
    POST: {
      ALL: "/api/software-versions",
    },
    PUT: {
      BY_ID: "/api/software-versions/:id",
    },
    DELETE: {
      BY_ID: "/api/software-versions/:id",
    },
  },
  ORDER: {
    GET: {
      ALL: "/api/orders",
      BY_ID: "/api/orders/:id",
    },
    POST: {
      ALL: "/api/orders",
      FIND: "/api/orders/find",
    },
    PUT: {
      BY_ID: "/api/orders/:id",
    },
    DELETE: {
      BY_ID: "/api/orders/:id",
    },
  },
};

export default API;
