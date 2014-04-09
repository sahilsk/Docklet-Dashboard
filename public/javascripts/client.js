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
  
socket.on("data", function(stream){
  console.log("Data:::::::::" + stream.toString()) ;

  if( stream.toString().length == 0)
    return;

  $("#dockerEventWindow .outputWindow").append("<hr/>" );
  var term = require('hypernal')();
  term.appendTo("#dockerEventWindow .outputWindow");
  term.write(stream); 

});

socket.on("event", function(data){
    console.log("Event:::::::::::::" + stream.status) ;

})


var dockerEvents = socket.substream('dockerEvents');

/*
var foo = socket.substream('foo');
foo.on('data', function (data) {
  console.log('recieved data', data);
}).on('end', function () {
  console.log('connection has closed or substream was closed');
});
*/

var Docklet = socket.resource('Docklet');

Docklet.on('ready', function () {

  console.log("Docklet resource ready")

});



/*************** 
GUI FUNCTION
****************/

var LOADING_GIF_24  = new Image;
LOADING_GIF_24.src="/images/refreshing_x24.gif";


//GLOBAL VARIABLES
  var selectedDockerHost = {};


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
       // $(dockletRow).find("a.action-refresh").on("click", refreshDocklet);
       // $(dockletRow).find("a.action-delete").on("click", deleteDocklet);


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
    var $row = $(this).closest("tr");
    var $tdArray = $row.find("td"); 

    var id = $(this).attr("docker-id");
    var $images  = $tdArray.eq(4);
    var $containers = $tdArray.eq(5);
    var $memoryLimit = $tdArray.eq(6);
 
    $($images, $containers, $memoryLimit).html( LOADING_GIF_24 );

    Docklet.info(id, function(res){
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
    var docker_id = $(this).attr("docker-id");

    var id = $(this).attr("docker-id");
 
    Docklet.explore(id, function(res){
      if(res.error){
        console.log("Error: ", res.error)
      }else{
        console.log(res.data);
        $imageTable =  _.template( $("#imageTableTemplate").html(), {images:res.data.images, dockerId:id} );

        res.data.imagesTable = $imageTable;
        
        $explorePanel = _.template( $("#explorePanelTemplate").html(), res.data );

        $("#panel_"+id).remove();
        $("#dynDataPlaceholder").html($explorePanel);
        $(".datepicker").pickadate();
         $(".timepicker").pickatime();

         //SET SELECTED DOCKERHOST INSTANCE
         selectedDockerHost = res.data.dockerHost

      }
    });
  }

  var monitorEvents = function(event){
    event.preventDefault();
    var id = $(this).attr("docker-id");
    
    var date = $("#panel_"+id).find(".datepicker").val();
    var time = $("#panel_"+id).find(".timepicker").val();
    var datetime = Date.parse( date+" "+time);
    //datetime= 1385863200000;
    if( isNaN(datetime) ){
      alert("Invalid date: " + date+" "+time);
      return;
    }
    var data ={
      id: id,
      opts: { since:datetime/1000 }
    }

    console.log("Trackng events since", data.opts.since)
    Docklet.events(data, function(res){
      if(res.error){
        console.log("Error :", res.error)
      }else{
        console.log(res.data);        
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

     $("body").on('click', "#dockerEvents", monitorEvents)



/******************** IMAGE TABLE *****************/


var renderImageInspectWindow =  function(){
  var imageId = $(this).text();

  console.log("fetch detailed image info of (%s) %j", imageId, selectedDockerHost); 

  var data = {
    imageId : $(this).text().trim(),
    dockerHost : selectedDockerHost
  }

  console.log( "Hostname",  selectedDockerHost.host)
  Docklet.inspectImage( data, function(res){

    if(res.error){
      console.log( "Error inspecting image: ", res.error);
    }else{
      console.log( selectedDockerHost);
      addFloatingWindow({title:"Image: "+imageId, result: res.data })

    }

  });
}

$("#dynDataPlaceholder").on("click", ".imageTable tr td:nth-child(2)" , renderImageInspectWindow);


/****************** CONTAINER TABLE *************/

var listContainers = function(e){
  e.preventDefault();

  console.log("fetching contianers from: %s:%s", selectedDockerHost.host, selectedDockerHost.port); 

  var data = {
    dockerHost : selectedDockerHost,
    opts : {
       all :$("form.loadContainerForm").find('[name="all"]').is(":checked"),
       size :$("form.loadContainerForm").find('[name="all"]').is(":checked")
    }   
  }

  var period = $(".loadContainerForm").find("[name='period']").val();


  var date = $(".loadContainerForm").find("[name='date']").val();
  var time = $(".loadContainerForm").find("[name='time']").val();

  var datetime = Date.parse( date+" "+time);
  //datetime= 1385863200000;
  if( !isNaN(datetime) ){
    data.opts[period] = datetime/1000;
  }
  console.log( "Fetching containers: ",  data.opts)
  Docklet.getContainers( data, function(res){

    if(res.error){
      console.log( "Error fetching containers: ", res.error);
    }else{
        
      console.log("Containers: ", res.data)
      var $containerTable = _.template( $("#containerTableTemplate").html(),{containers: res.data} );
      var oldContainerTable = $("#dynDataPlaceholder").find("#containersTable");

      if( oldContainerTable.length  > 0  ){
        $(oldContainerTable).remove();
      }
      $("#containersTable").remove();
      $("#dynDataPlaceholder").find(".containersWrapper").append( $containerTable);

    }
  });
}

var renderContainerInspectWindow =  function(){
  var containerId = $(this).attr("container-id").trim();

  console.log("Inspecting container: <%s> on ", containerId, selectedDockerHost); 

  var data = {
    containerId : containerId,
    dockerHost : selectedDockerHost
  };

  Docklet.inspectContainer( data, function(res){
    if(res.error){
      console.log( "Error inspecting container: ", res.error);
    }else{
      console.log( selectedDockerHost);
      addFloatingWindow({title:"Container: "+ containerId.substring(0, 14) , result: res.data, cssClass:"panel-info" })
    }

  });
}


var listProcesses = function(e){
  e.preventDefault();

  var containerId = $(this).attr("container-id");

  var data = {
    dockerHost : selectedDockerHost,
    containerId:containerId
  }
  console.log("fetching processes running inside %s on %s %s",containerId,  selectedDockerHost.host, selectedDockerHost.port); 

  Docklet.getContainerProcesses( data, function(res){

    if(res.error){
      console.log( "Error fetching containers: ", res.error);
    }else{
          
      console.log("Processes: ", res.data);
      return;
      var $containerTable = _.template( $("#containerTableTemplate").html(),{containers: res.data} );
      var oldContainerTable = $("#dynDataPlaceholder").find("#containersTable");

      if( oldContainerTable.length  > 0  ){
        $(oldContainerTable).remove();
      }
      $("#containersTable").remove();
      $("#dynDataPlaceholder").find(".containersWrapper").append( $containerTable);

    }
  });
}


  //BIND 
    //LOAD PROCESSES
    $("#dynDataPlaceholder").on("click", "#containersTable tr td:last-child a" , listProcesses);



/****************** PROCESSES TABLE *************/







/*****************
FLOATING WINDOW
*****************/

var addFloatingWindow = function(data){
  var cssClass = "panel-primary";
  if( data.hasOwnProperty( "cssClass")){
    cssClass = data.cssClass;
  }
  var floatingWindow = _.template( $("#floatingWindowTemplate").html(),{title:data.title, cssClass:cssClass } );

  console.log( floatingWindow);
  $(floatingWindow).prependTo(".floatingWindowList");

  var term = require('hypernal')();
  term.appendTo(".floatingWindowList .floatingWindow:first-child .outputWindow" );
  term.write(data.result);  

}

var minimizeWindow = function(){
  console.log("Minimizing window...")
  var floatingWindow = $(this).closest(".floatingWindow");
  
  $panelBody  = $(this).parent().parent().next();
  $panelBody.toggleClass("hidden")

  if( $panelBody.hasClass('hidden') ){
      console.log("Changing height: 20%");
      $(floatingWindow).width("300px");
  } else{
    $(floatingWindow).width("600px");
  }

}
var closeFloatingWindow = function(){
  console.log("closing window...");
  $(this).closest(".floatingWindow").remove();
}

$("body").on("click", ".minFloatingWindow", minimizeWindow );
$("body").on("click", ".closeFloatingWindow", closeFloatingWindow );


$("body").on("click", "#loadContainers", listContainers)



Backbone.history.start();
