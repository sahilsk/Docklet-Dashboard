var _= require("underscore")

var AppRouter = require("./client/routes.js");


var app_router = new AppRouter;


 
var socket = Primus.connect('ws://'+window.location.host );
socket.on('open', function () {	
  socket.send('hi', 'hello world');
  socket.on('hello', function (msg) {
	  console.log(msg);
  });

});
  

var Docklet = socket.resource('Docklet');

Docklet.on('ready', function () {

  console.log("Docklet resource ready")

});



/*************** 
GUI FUNCTION
****************/

var LOADING_GIF_24  = new Image;
LOADING_GIF_24.src="/images/refreshing_x24.gif";


// Show form to add docklet
$("#newDocklet").on("click", function(e){
    e.preventDefault();
    $("#actionStatus").addClass("hidden");
     $("#docklets_new").modal("show");
})
// Handle new docklet request
$("#newDockletForm").on( "submit", function( event ) {
  event.preventDefault();
  var data = {
    "title" : $(this).find("#title").val(),
  	"host" :   	$( this ).find('#host').val(),
  	"port" : parseInt($(this).find("#port").val())
  }
  console.log( data );


  Docklet.create( data, function(jRes){
     if( jRes.error ){
        console.log("Error creating docklet: " , _.compact(jRes.error))
          $("#actionStatus").html( "<strong> Warning </strong> "+ JSON.stringify(jRes.error))
          $("#actionStatus").addClass("alert-danger").removeClass("hidden");


     }else{
        console.log("Docklet created successfully");
          $("#actionStatus").html( jRes.data.title + " created successfully!!!")
          $("#actionStatus").removeClass("alert-danger").addClass("alert-success").removeClass("hidden");
          $("#docklets_new").modal("hide")
     }

  } );
});

// Bind actions to docklets 

var $dockletContainer = $("#dockletsTable").find("tr td");
  $dockletContainer.find("a.action-refresh").on("click", function(event){
    event.preventDefault();
    var data = {
       host: $(this).closest("tr").find("td").eq(2).text(),
       port:  $(this).closest("tr").find("td").eq(3).text()
    };
    $images  = $(this).closest("tr").find("td").eq(4);
    $containers = $(this).closest("tr").find("td").eq(5);

    $images.html( LOADING_GIF_24 );
    $containers.html( LOADING_GIF_24  );

    console.log(data);
    Docklet.info(data, function(res){
      if(res.error){
        console.log(res.error);
      }else{
        console.log( res.data);
        $images.text( res.data.Images);
        $containers.text( res.data.Containers);
      }
    });
  })

  $dockletContainer.find("a.action-delete").on("click", function(event){
    event.preventDefault();
    var id = $(this).attr("docker-id");
    var selectedRow = $(this).closest("tr");
    selectedRow.addClass("danger");
    console.log("Request to delete ", id)

    var action =  confirm("Are you sure you want to remove this docklet?");
    if( action ){
      Docklet.delete(id, function(res){
        if(res.error){
          console.log("Failed to delete  :" + res.error);
        }else{
          console.log( "Docklet: "+ id + " deleted successfully");
          $SelectedRow.remove();
        }
      });
    }


  })




Backbone.history.start();

