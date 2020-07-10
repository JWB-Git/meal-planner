//vue.js

app = new Vue({
    el: '#app',

    data(){
        return{
            //User Info
            name: '',
            profileUrl: '',
            email: '',

            //Input Form
            newDate: '',
            newFood: '',

            //Menu Array
            menuObjects: [],

            //Edit Functionality
            editId: '',
            editFood: '',

            //Recipe Array
            recipeObjects: [],

            //Add Recipe Vars
            addRecipe: '',
            addRecipeUrl: '',
            addRecipeImage: ''
        }
    },

    methods: {
        login: function(){
            var provider = new firebase.auth.GoogleAuthProvider();

            firebase.auth().signInWithRedirect(provider);

            firebase.auth.getRedirectResult().then(function(result) {
            }).catch(function(error) {
                console.error(error.message);
            })
        },

        logout: function(){
            firebase.auth().signOut().then(function() {
                console.log('Signed out successfully');
            }).catch(function(error){
                console.error(error.message);
            });
        },

        addToMenu: function (){
            if(this.newFood !== '' && this.newDate !== ''){
                db.collection("calendar").add({
                    userEmail: this.email,
                    date: new Date(this.newDate),
                    food: this.newFood
                }).then(function(docRef){
                    console.log("Document written with ID:", docRef.id);
                }).catch(function(error){
                    console.error("Error adding document: ", error);
                });

                this.newDate = '';
                this.newFood = '';

                this.updateMenus();
            }
            else{
                alert("Please fill in the form fully");
            }
        },

        updateMenus: function(){
            const unixDay = 86400000
            let userMenus = [];

            db.collection("calendar").where("userEmail", "==", this.email).where("date", ">=", new Date(Date.now() - unixDay)).orderBy('date', 'asc').limit(7)
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(meal => {
                        userMenus.push({id: meal.id, ...meal.data()})
                    });
                });

            this.menuObjects = userMenus;
        },

        deleteMeal: function(mealId){
            db.collection("calendar").doc(mealId).delete().then(function(){
                console.log("Document deleted with ID:", mealId);
            }).catch(function(error){
                console.error("Error removing document:", error);
            });

            this.updateMenus();
        },

        setEditId: function(mealId){
            this.editId = mealId;

            this.getEditInfo(this.editId)
        },

        getEditInfo: function(mealId){
            db.collection('calendar').doc(mealId)
                .get().then(meal => {
                    if(meal.exists){
                        this.editFood = meal.data().food;
                    }
            });
        },

        editMeal: function(mealId){
            db.collection('calendar').doc(mealId)
                .set({food: this.editFood,}, {merge: true})
                .then(function(){
                    console.log("Document edited with ID:", mealId);
                }).catch(function(error){
                    console.error("Error editing document:", error);
            });

            this.updateMenus();
        },

        addToRecipes: function(){
            if(this.addRecipe !== '' && this.addRecipeUrl !== '' && this.addRecipeImage !== ''){
                db.collection("recipes").add({
                    userEmail: this.email,
                    recipe: this.addRecipe,
                    recipeUrl: this.addRecipeUrl,
                    recipeImage: this.addRecipeImage
                }).then(function(docRef){
                    console.log("Document written with ID:", docRef.id);
                }).catch(function(error){
                    console.error("Error adding document: ", error);
                });

                this.addRecipe = '';
                this.addRecipeUrl = '';
                this.addRecipeImage = '';

                this.updateRecipes();
            }
            else{
                alert("Please fill in the form fully");
            }
        },

        updateRecipes: function(){
            let userRecipes = [];

            db.collection("recipes").where("userEmail", "==", this.email)
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(recipe => {
                        userRecipes.push({id: recipe.id, ...recipe.data()})
                    });
                });

            this.recipeObjects = userRecipes;
        },

        deleteRecipe: function(recipeId){
            db.collection("recipes").doc(recipeId).delete().then(function(){
                console.log("Document deleted with ID:", recipeId);
            }).catch(function(error){
                console.error("Error removing document:", error);
            });

            this.updateRecipes();
        }
    },

    created: function(){
            firebase.auth().onAuthStateChanged((user) => {
                if(user){ //User is signed in

                    //Change displayed information
                    $('#login-button').hide();
                    $('#logout-button').show();
                    $('#profile').show()

                    $('#logged-in').show();
                    $('#logged-out').hide();

                    //Set Vue instance data to user info
                    this.name = user.displayName;
                    this.profileUrl = user.photoURL;
                    this.email = user.email;

                    //Get Data from Database for menu and recipes
                    this.updateMenus();
                    this.updateRecipes();

                }
                else{
                    //Change displayed Information
                    $('#login-button').show();
                    $('#logout-button').hide();
                    $('#profile').hide()

                    $('#logged-in').hide();
                    $('#logged-out').show();

                    //Reset Visible Vue Instances (Name, Profile Pic etc.)
                    this.name, this.profileUrl = '';
                }
            });
        },


});

