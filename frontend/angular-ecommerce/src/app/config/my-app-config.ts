export default {
  auth: {
    domain: "dev-k4jpaii4pf4as4mw.us.auth0.com",
    clientId: "MByYHu7BDMihV61EsYevpogimxOkhTYS",
    authorizationParams: {
      redirect_uri: "http://localhost:4200/login/callback",
      audience: "http://localhost:8080",
    },
  },
  httpInterceptor: {
    allowedList: [
      'http://localhost:8080/api/orders/**',
      'http://localhost:8080/api/checkout/purchase'
    ],
  },
}