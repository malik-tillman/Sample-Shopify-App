require('isomorphic-fetch');

const dotenv = require('dotenv'),
    Koa = require('koa'),
    next = require('next'),
    { default: createShopifyAuth } = require('@shopify/koa-shopify-auth'),
    { verifyRequest } = require('koa-session'),
    session = require('koa-session');

dotenv.config();

const port = parseInt(process.env.PORT, 10) || 3000,
    dev = process.env.NODE_ENV !== 'production',
    app = next({ dev }),
    handle = app.getRequestHandler();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;

app.prepare().then(() => {
    const server = new Koa();

    server.use(session({secure: true, sameSite: 'none' }, server));

    server.keys = [SHOPIFY_API_SECRET_KEY];

    server.use(
        createShopifyAuth({
            apiKey: SHOPIFY_API_KEY,
            secret: SHOPIFY_API_SECRET_KEY,
            scopes: ['read_products'],
            afterAuth(ctx) {
                const { shop, accessToken } = ctx.session;

                ctx.redirect('/');
            },
        }),
    );

    //server.use(verifyRequest());

    server.use(async (ctx) => {
        await handle(ctx.req, ctx.res);

        ctx.respond = false;
        ctx.res.statusCode = 200;
    })

    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    })
});
