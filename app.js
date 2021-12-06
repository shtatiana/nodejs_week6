export default function(express, bodyParser, createReadStream, crypto, http, m, UserSchema) {
    const app = express();
    const CORS = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,OPTIONS,DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers, Accept'
    };
    const login = 'Tatiana';
    const User = m.model('User', UserSchema);
    
    app
    .all('/login/', (req, res) => {
        res.set(CORS);
        res.send(login);
        })
    
    .all('/code/', (req, res) => {
        res.set(CORS);
        const path = import.meta.url.substring(7);
        createReadStream(path).pipe(res);
        })
    .all('/sha1/:input/', (req, res) => {
        res.set(CORS);
        const hash_sha1 = crypto.createHash('sha1')
        .update(req.params.input)
        .digest('hex')
        res.send(hash_sha1);
        })
    
    .use(bodyParser.urlencoded({extended: true}))
    .all('/req/', (req, res) => {
        res.set(CORS);
        if (req.method === "GET" || req.method === "POST") {
            const address = req.method === "GET" ? req.query.addr : req.body.addr;
            if (address) {
               http.get(address, (resp) => {
                let data = '';
                resp.on('data', (chunk) => { data += chunk; });
                  resp.on('end', () => {
                      res.send(data);
                  });
                }) 
            }
            else {
                res.send(login);
            }
        }
        else {
            res.send(login);
        }
        })
    .post('/insert/', async (req, res) => {
        const { URL, login, password } = req.body;
        try {
          await m.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true });
        } catch (e) {
          res.send(e.stack);   
        }

        const newUser = new User({ login, password });
        await newUser.save();
        res.status(201).json({ successsss: true, login });
    })
    .all('/*', (req, res) => {
        res.set(CORS);
        res.send(login);
        })
   return app; 
}