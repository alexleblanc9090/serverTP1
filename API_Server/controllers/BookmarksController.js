const Repository = require('../models/Repository');

module.exports = 
class BookmarksController extends require('./Controller') {
    constructor(req, res){
        super(req, res);
        this.BookmarksRepository = new Repository('bookmarks');
    }

    /*
        Les validations se font ici.
        -> inputs pour un ajout
        ->id valide pour un  get.
        ->doublon pour les ajouts
    */



    // Permet d'aller chercher tous les bookmarks.
    getAll(){
        console.log(this.req.url)
        this.response.JSON(this.BookmarksRepository.getAll());
    }

    //Permet d'aller chercher un bookmark en particulier.
    get(id){
        let parsed = parseInt(id);
        if(!isNaN(parsed))
            this.response.JSON(this.BookmarksRepository.get(parsed));
        else
            this.response.JSON(this.BookmarksRepository.getAll());
    }

    post(bookmark){  
        let doublonName = false;
        let nameEmpty = false;
        let urlEmpty = false;
        let catEmpty = false;
        let invalidUrl = false;
        const myObj = this.BookmarksRepository.getAll();
        
        //let obj = Object.keys(myObj);
        //Validation du champ Name pour doublon
        myObj.forEach(o => {
            if(o['Name'] == bookmark.Name)
            doublonName = true;
        });

        if(bookmark['Name'] === "" || bookmark['Name'] === null || bookmark['Name'] === undefined)
            nameEmpty = true;
            
        if(bookmark['Url'] === "" || bookmark['Url'] === null || bookmark['Url'] === undefined)
            urlEmpty = true;

        if(bookmark['Category'] === "" || bookmark['Category'] === null || bookmark['Category'] === undefined)
            catEmpty = true;   

        let pattern = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;


        if(!pattern.test(bookmark["Url"]))
            invalidUrl = true;

        if(invalidUrl || nameEmpty || catEmpty || urlEmpty || doublonName)
        {
            this.response.internalError();
        }
        else
        {
            let newBookmark = this.BookmarksRepository.add(bookmark);   
            if (newBookmark)
                this.response.created(JSON.stringify(newBookmark));
            else
                this.response.internalError();
        }                
    }

    // MANQUE VALIDATION!!!!!
    put(bookmark){
        let doublonName = false;
        let nameEmpty = false;
        let urlEmpty = false;
        let catEmpty = false;
        let invalidUrl = false;
        const myObj = this.BookmarksRepository.getAll();
        
        //let obj = Object.keys(myObj);
        //Validation du champ Name pour doublon
        myObj.forEach(o => {
            if(o['Name'] == bookmark.Name)
                if(o['Id'] != bookmark.Id)
                    doublonName = true;
        });

        if(bookmark['Name'] === "" || bookmark['Name'] === null || bookmark['Name'] === undefined)
            nameEmpty = true;
            
        if(bookmark['Url'] === "" || bookmark['Url'] === null || bookmark['Url'] === undefined)
            urlEmpty = true;

        if(bookmark['Category'] === "" || bookmark['Category'] === null || bookmark['Category'] === undefined)
            catEmpty = true;   

        let pattern = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;


        if(!pattern.test(bookmark["Url"]))
            invalidUrl = true;

        if(invalidUrl || nameEmpty || catEmpty || urlEmpty || doublonName)
        {
            //Update non fait.
            this.response.internalError();
        }
        else{
            // todo : validate contact before updating
            if (this.BookmarksRepository.update(bookmark))
                this.response.ok();
            else 
                this.response.notFound();
        }
    }

    //Supprime l'élément dans la "BD" où le Id est...
    remove(id){
        let parsed = parseInt(id);
        if (this.BookmarksRepository.remove(id))
            this.response.accepted();
        else
            this.response.notFound();
    }
}