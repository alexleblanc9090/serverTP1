
//Sélectionne la première lettre du paramètre et la met en majuscule.

function capitalizeFirstLetter(s){
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1);   
}

exports.dispatch_API_EndPoint = function(req, res){

    const Response = require("./response");
    let response = new Response(res);

    // this function extract the JSON data from the body of the request
    // and and pass it to controllerMethod
    // if an error occurs it will send an error response
    function processJSONBody(req, controller, methodName) {
        let body = [];
        req.on('data', chunk => {
            body.push(chunk);
        }).on('end', () => {
            try {
                // we assume that the data is in the JSON format
                if (req.headers['content-type'] === "application/json")
                    controller[methodName](JSON.parse(body));
                else 
                    response.unsupported();
            } catch(error){
                console.log(error);
                response.unprocessable();
            }
        });
    }

    let controllerName = '';
    let id = undefined;


    //Retourne true ou false et vérifie que la requête est valide.
    function API_Endpoint_Ok(url){

        let queryStringMarkerPos = url.indexOf('?'); // index du ? dans la requête


        if (queryStringMarkerPos > -1) // Est-ce que la requête contient un "?"
            url = url.substr(0, queryStringMarkerPos);//GARDE JUSTE LA PARTIE AVANT LE "?""


        /*********************************************************/
        if (url.indexOf('/api/') > -1) //Est-ce que la requête contient "/api/" -> si non, retourne false
        {
            /*
                Question: si la requête est comme ça LocalHost:5000/autre/api/bookmarks -> Validation fonctionne pas ?
                Question: pourquoi dans le tableau urlParts le premier élément est ""
                Question: si on mets des choses pas rapport après /api/bookmarks/ ça retourne quand même true ?
            */
            let urlParts = url.split("/"); //Supposé donner ["","api","bookmarks"] (2 éléments)

            //À ce point on sait qu'il y a un .../api/... dans la requête

            // do we have a resource name?
            if (urlParts.length > 2) {
                // by convention controller name -> NameController
                controllerName = capitalizeFirstLetter(urlParts[2]) + 'Controller'; //Rend la première lettre du controller en majuscule
                // do we have an id?
                if (urlParts.length > 3){
                    if (urlParts[3] !== '') {
                        id = parseInt(urlParts[3]);
                        if (isNaN(id)) { 
                            response.badRequest();
                            // bad id
                            return false;
                        } else
                        // we have a valid id
                        return true;

                    } else
                     // it is ok to have no id
                     return true;
                } else
                    // it is ok to have no id
                    return true;
            }
        }
        // bad API endpoint
        return false;
    }
    
    //Si la requête contient seulement /api -> retourne la liste des endpoints possible pour l'API
    if (req.url == "/api"){
        const endpoints = require('./endpoints');
        endpoints.list(res);
        return true;
    }

    if (API_Endpoint_Ok(req.url)) {
        try{
            // dynamically import the targeted controller
            // if the controllerName does not exist the catch section will be called

            /*
                Question: La ligne suivante fait quoi ?
            */

            const Controller = require('./controllers/' + controllerName);
            // instanciate the controller       
            let controller =  new Controller(req, res);

            if (req.method === 'GET') 
            {
                if(req.url === '/api/' + controllerName.replace('Controller','').toLocaleLowerCase())
                    controller.getAll();
                else
                {
                    let id = req.url.replace('/api/' + controllerName.replace('Controller','').toLocaleLowerCase() + '/', '');
                    controller.get(id);
                }
                // request consumed
                return true;
            }
            if (req.method === 'POST'){
                processJSONBody(req, controller,"post");
                // request consumed
                return true;
            }
            if (req.method === 'PUT'){
                processJSONBody(req, controller,"put");
                // request consumed
                return true;
            }
            //NON FONCTIONNEL!!!!!
            if (req.method === 'PATCH'){
                processJSONBody(req, controller,"patch");
                // request consumed
                return true;
            }
            if (req.method === 'DELETE') {
                if (!isNaN(id))
                    controller.remove(id);
                else 
                    response.badRequest();
                // request consumed
                return true;
            }
        } catch(error){
            // catch likely called because of missing controller class
            // i.e. require('./' + controllerName) failed
            // but also any unhandled error...
            console.log(error);
            console.log('endpoint not found');
            response.notFound();
                // request consumed
                return true;
        }
    }
    // not an API endpoint
    // request not consumed
    // must be handled by another middleware
    return false;
}