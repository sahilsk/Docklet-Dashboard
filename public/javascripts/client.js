var _= require("underscore")
window._ = _;

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
        var tr = "<tr></tr>";
        $tr = $(tr);

        jRes.data.index = $("#dockletsTable").find("tbody").find("tr").size() +1 ;

        var dockletRow = _.template( $("#dockletRowTemplate").html(),  jRes.data  );
        $(dockletRow).find("a.action-refresh").on("click", refreshDocklet);
        $(dockletRow).find("a.action-delete").on("click", deleteDocklet);


        console.log( dockletRow );
        $("#dockletsTable").find("tbody").append( dockletRow );
          
        $("#actionStatus").html( jRes.data.title + " created successfully!!!");
        $("#actionStatus").removeClass("alert-danger").addClass("alert-success").removeClass("hidden");
        $("#docklets_new").modal("hide");
     }

  } );
});

// Bind actions to docklets 

var $dockletContainer = $("#dockletsTable tbody");
  

  var refreshDocklet = function(event){
    event.preventDefault(); 
    $row = $(this).closest("tr");
    $tdArray = $row.find("td"); 

    var data = {
       host: $tdArray.eq(2).text().trim(),
       port: $tdArray.eq(3).text().trim()
    };
    $images  = $tdArray.eq(4);
    $containers = $tdArray.eq(5);
    $memoryLimit = $tdArray.eq(6);
 
    $($images, $containers, $memoryLimit).html( LOADING_GIF_24 );

    console.log(data);
    Docklet.info(data, function(res){
      if(res.error){
        console.log(res.error);
      }else{ 
        console.log( res.data);
        $images.text( res.data.Images);
        $containers.text( res.data.Containers);
        $memoryLimit.text( res.data.MemoryLimit);
      }
    });
  }

  var deleteDocklet = function(event){
    event.preventDefault();
    var id = $(this).attr("docker-id");
    $row = $(this).closest("tr");
    $tdArray = $row.find("td");
   
    $row.addClass("danger");
    console.log("Request to delete ", id)

    var action =  confirm("Are you sure you want to remove this docklet?");
    if( action ){
      Docklet.delete(id, function(res){
        if(res.error){
          console.log("Failed to delete  :" + res.error);
        }else{
          console.log( "Docklet: "+ id + " deleted successfully");
          $row.fadeOut().remove();
        }
      });
    }else{
      $row.removeClass("danger");
    }
  }

  var exploreDocklet = function( event){
    event.preventDefault(); 
    $row = $(this).closest("tr");
    $tdArray = $row.find("td"); 

    var data = {
       host: $tdArray.eq(2).text().trim(),
       port: $tdArray.eq(3).text().trim()
    };


    Docklet.getImages(data, function(res){
      if(res.error){
        console.log("Error: ", res.error)
      }else{
        console.log(res.data);
        $imageTable =  _.template( $("#imageTableTemplate").html(), {images:res.data} );
        console.log($imageTable);
        $("body").append($imageTable);
      }

    });
  }

  //BIND 
    //REFRESH DOCKLET
     $dockletContainer.on("click", "a.action-refresh", refreshDocklet);
    //DELETE EXPLORE
     $dockletContainer.on("click", "a.action-explore", exploreDocklet);
   //DELETE DOCKLET
     $dockletContainer.on("click", "a.action-delete", deleteDocklet);




Backbone.history.start();

