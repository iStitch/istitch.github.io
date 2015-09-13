var ref = new Firebase("https://opencv.firebaseio.com/");
var aviSpeed = "aviquick"
var processed = "no"
var upload = true;

var dataRef = ref.child("data");
dataRef.child("average").once("value", function(snapshot){
    $(".avgTort").text(snapshot.val().tortuosity.val);
    $(".avglen").text(snapshot.val().length.val);
    $(".avgCNBD").text(snapshot.val().CNBD.val);
    $(".avgDens").text(snapshot.val().density.val);
    $(".avgArea").text(snapshot.val().imagearea.val);
});
dataRef.child("uploads").on("value", function(snapshot){
    $(".numUsers").text(snapshot.val());
});
ref.child("serverstatus").on("value", function(snapshot){
    $(".server-status").text(snapshot.val());
});

function addImage(link, type, processed){

    var tasksRef = ref.child("tasks");
    var newMessageRef = tasksRef.push({
        'src': link,
        'type': type,
        'p': processed
    });
    var id = String(newMessageRef.key());
    var completionRef = ref.child("completion");

    completionRef.on("child_changed", function(snapshot) {
        if(snapshot.key() == id){
            updateScreen(
                snapshot.child("length").val(),
                snapshot.child("density").val(),
                snapshot.child("tortuosity").val(),
                snapshot.child("src").val(),
                snapshot.child("CNBD").val(),
                snapshot.child("imagearea").val(),
                snapshot.child("time").val()
            );
            setTimeout(function(){
                tasksRef.child(id).remove();
            }, 3000);

        }
    });
}


function updateScreen(length,density,tortuosity,b64pix, CNBD, imageArea, time){
    if(upload){
        dataRef.child("uploads").once("value", function(snapshot){
            var updatedUploads = snapshot.val() + 1;
            dataRef.child("uploads").set(updatedUploads);
        });
        upload = false;
    }

    if( b64pix != null && b64pix != "oops"){
        $(".userTort").text(tortuosity);
        $(".userlen").text(length);
        $(".userCNBD").text(CNBD);
        $(".userDens").text(density);
        $(".userArea").text(imageArea);


        console.log(b64pix);

        console.log(user)
        var userRef = new Firebase("https://opencv.firebaseio.com/users/" + user + "/pictures");
        var deleteDef = userRef.child("defaultPic");
        deleteDef.remove();
        userRef.push({
            density: density,
            length: length,
            src: b64pix,
            tortuosity: tortuosity,
            CNBD: CNBD,
            imagearea: imageArea,
            time: time,
        });
    }

    $(".upload-camera").hide();
    $(".fp__btn").hide();
    $(".stitched-image").attr("src", "data:image/jpg;base64," + b64pix);
    $(".stitched-image").css({"width" : "100%"});
}


$(".filepickerimg").click(showFilePickImg);
$(".filepickervid").click(showFilePickVid);


function showFilePickImg(){
    upload = true;
    filepicker.pickMultiple(
        {
            mimetype: 'image/*',
            maxFiles: 1,
        },
        function(Blobs){
            var images = [];
            for(var i = 0; i < Blobs.length; i++){
                images.push(Blobs[i].url);
            }
            addImage(images, "jpg", processed);
        },
        function(error){
            console.log(JSON.stringify(error));
        }

    );
}


function showFilePickVid(){
    upload = true;
    filepicker.pick(
        {
            mimetype: 'video/*'
        },
        function(Blob){
            var videos = [Blob.url];
            console.log(processed);
            addImage(videos, aviSpeed, processed);
        },
        function(FPError){
            console.log(FPError.toString());
        }
    );
}

function changeCheckVal(elem){
    if(!elem.checked){
        $(".process").text("Unprocessed");
        processed = "no";
    }else{
        $(".process").text("Processed");
        processed = "yes";
    }
}

window.addEventListener("beforeunload", function (e) {
    var confirmationMessage = 'The server is currently processing your image. ';
    confirmationMessage += 'If you leave before it finishes, your image will be deleted.';

    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
});

setTimeout(function(){
    $(".fp__btn").hide();
},100);
