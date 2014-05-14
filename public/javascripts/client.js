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

  $userAlertWindow .find(".modal-content h4").text("Connected");
  $userAlertWindow .find(".modal-content p").text("You're back online. !!!");
  $userAlertWindow.find(".modal-content p").attr("class", "bg-success");

  setTimeout(function(){
      $("#smallModalWindow").modal("hide");
  }, 1000);
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
  
socket.on("close", function(spark){
  console.log("Disconnected from server");
  $userAlertWindow.find(".modal-content h4").text("Disconnected");
  $userAlertWindow.find(".modal-content p").text("You're disconnected.Trying connecting...");
  $userAlertWindow.find(".modal-content p").attr("class", "bg-danger");
  $("#smallModalWindow").modal("show");
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
  var $userAlertWindow  =  $("#smallModalWindow");


// Show form to add docklet
$("#newDocklet").on("click", function(e){
  e.preventDefault();
  $("#actionStatus").addClass("hidden");
  $("#docklets_new").modal("show");
});

// Handle new docklet request
$("#newDockletForm").on( "submit", function( event ) {
  event.preventDefault();
  var data = {
    "title" : $(this).find("#title").val(),
  	"host" :   	$( this ).find('#host').val(),
  	"port" : parseInt($(this).find("#port").val()),
    "healthCheckPath" :   $( this ).find('#healthURL').val()

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
        console.log( dockletRow );


//        $("#dockletsTable").find("tbody").append( dockletRow );
          
        $("#actionStatus").html( jRes.data.title + " created successfully!!!");
        $("#actionStatus").removeClass("alert-danger").addClass("alert-success").removeClass("hidden");
      
        setTimeout( function(){
          $("#docklets_new").modal("hide");
          window.location.href= window.location.href;
        }, 500);
     
     }

  } );
});

/**************** DOCKLETS *******************/

var $dockletContainer = $("#dockletsTable tbody");
  

  var refreshDocklet = function(event){
    event.preventDefault(); 
    var $row = $(this).closest("tr");
    var $tdArray = $row.find("td"); 

    var id = $(this).attr("docker-id");
    var $images  = $tdArray.eq(4);
    var $containers = $tdArray.eq(5);
    var $memoryLimit = $tdArray.eq(6);
    var $healthCheck = $tdArray.eq(7);


    var OK_ELEM = $("<span class='label label-success glyphicon glyphicon-ok text-center'> OK </span>");
    var BAD_ELEM = $("<span class='label label-danger glyphicon glyphicon-warning-sign text-center'> FAIL </span>");
  

    $images.html( $(LOADING_GIF_24).clone() );
    $containers.html(  $(LOADING_GIF_24).clone() );
    $memoryLimit.html(    $(LOADING_GIF_24).clone() );
    $healthCheck.html(    $(LOADING_GIF_24).clone() );


//    $($images, $containers, $memoryLimit).html( LOADING_GIF_24 );

    Docklet.info(id, function(res){
      if(res.error){
        console.log(res.error);
        $images.text( "--NA--" );
        $containers.text( "--NA--" );
        $memoryLimit.text( "--NA--" );
        $healthCheck.html( BAD_ELEM );

      }else{ 
        console.log( res.data);
        $images.text( res.data.Images);
        $containers.text( res.data.Containers);
        $memoryLimit.text( res.data.MemoryLimit);
        $healthCheck.html(res.data.isHealthy? OK_ELEM : BAD_ELEM );      

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

  // list images
  var exploreDocklet = function( event){
    event.preventDefault(); 

    //Highlight selected container
    $(this).closest("table").find("tr").removeClass("info");
    $(this).closest("tr").addClass("info")
  
    $row = $(this).closest("tr");
    $tdArray = $row.find("td"); 
    var docker_id = $(this).attr("docker-id");

    var id = $(this).attr("docker-id");
 
    Docklet.explore(id, function(res){
      if(res.error){
        console.log("Error: ", res.error)
      }else{
        console.log(res.data);
        $imageTable =  _.template( $("#imageTableTemplate").html(), {images: _.first(res.data.images, 10) , dockerId:id} );

        $dockerEventsWindow = _.template( $("#dockerEventsTemplate").html(), {dockerId:id});

        res.data.imagesTable = $imageTable;
        res.data.dockerEventsWindow = $dockerEventsWindow;
        
        $explorePanel = _.template( $("#explorePanelTemplate").html(), res.data );

        $("#panel_"+id).remove();

        $("#dynDataPlaceholder").html($explorePanel);

        //Instantiate datepicker
          $(".datepicker").pickadate();
          $(".timepicker").pickatime();

         //SET SELECTED DOCKERHOST INSTANCE
         selectedDockerHost = res.data.dockerHost

        // SCROLL TO IMAGE TABLE
        var $imagesTable =  $("#imagesTable");
        $imagesTable.addClass("panel-success");
        //Scroll to process table
        $("body").animate({
          scrollTop: $imagesTable.offset().top 
         }, 1000, function() {
            $imagesTable .removeClass("panel-success");
        });            

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

  if( !$(this).attr("image-id") )
    return; 
  var imageId = $(this).attr("image-id").trim();

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
      addFloatingWindow({title:"Image: "+imageId.substring(0, 14), result: res.data })

    }

  });
}

$("#dynDataPlaceholder").on("click", ".imageTable tr td:nth-child(2) a" , renderImageInspectWindow);


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
      //remove old containers
      $("#dynDataPlaceholder").find("#containersTable").remove();
      $("#dynDataPlaceholder").find(".containersWrapper").append( $containerTable);

      var $containerTable = $("#containersTable");
      $containerTable.addClass("panel-success");
      //Scroll to process table
      $("body").animate({
        scrollTop:  $containerTable.offset().top 
       }, 1000, function() {
            $containerTable.removeClass("panel-success");
      });      

    }
  });
}

var renderContainerInspectWindow =  function(){
  if( !$(this).attr("container-id") )
    return; 
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

$("#dynDataPlaceholder").on("click", "#containersTable tr td:nth-child(2) a" , renderContainerInspectWindow);

/****************** PROCESSES TABLE *************/

var listProcesses = function(e){
  e.preventDefault();


  //Highlight selected container
  $(this).closest("table").find("tr").removeClass("info");
  $(this).closest("tr").addClass("info")



  var containerId = $(this).attr("container-id");

  var data = {
    dockerHost : selectedDockerHost,
    containerId:containerId
  }
  console.log("fetching processes running inside %s on %s %s",containerId,  selectedDockerHost.host, selectedDockerHost.port); 

  Docklet.getContainerProcesses( data, function(res){

    if(res.error){
      console.log( "Error fetching containers: ", res.error);
      addFloatingWindow({title:"ERROR" , result: res.error, cssClass:"panel-danger" })

    }else{
          
      var templateData  ={
        titles:  res.data.Titles,
        processes : res.data.Processes
      }
      console.log( templateData);
      var $psTable = _.template( $("#psTableTemplate").html(),templateData );

      $("#processesTable").remove();
      $("#dynDataPlaceholder").append( $psTable);

      $("#processesTable").addClass("panel-success");
      //Scroll to process table
      $("body").animate({
        scrollTop: $("#processesTable").offset().top 
       }, 1000, function() {
           $("#processesTable").removeClass("panel-success");
      });

    }
  });
}

  //BIND 
    $("#dynDataPlaceholder").on("click", "#containersTable tr td:last-child a" , listProcesses);

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

var minimizeWindow = function(e){
  e.preventDefault();
  console.log("Minimizing window...")
  var floatingWindow = $(this).closest(".floatingWindow");
  
  $panelBody  = $(this).parent().parent().next();
  $panelBody.toggleClass("hidden")

  if( $panelBody.hasClass('hidden') ){
      console.log("Changing height: 20%");
      $(floatingWindow).width("300px");
  } else{
    $(floatingWindow).width("");
  }
}
var clearOutputWindow = function(e){
  e.preventDefault();
  console.log("clearing output window..")
  $(this).closest(".panel-body").find(".outputWindow").text("");
}

var closeFloatingWindow = function(){
  console.log("closing window...");
  $(this).closest(".floatingWindow").remove();
}

// BIND
  $("body").on("click", ".minFloatingWindow", minimizeWindow );
  $("body").on("click", ".clearOutputWindow", clearOutputWindow );
  $("body").on("click", ".closeFloatingWindow", closeFloatingWindow );
  $("body").on("click", "#loadContainers", listContainers)

$(document).ready( function(){
  
})


Backbone.history.start();
