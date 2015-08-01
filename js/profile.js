var userPicRef = new Firebase("https://opencv.firebaseio.com/users/"+ user +"/pictures");
var zip = new JSZip();
$(".img-download").hide();
waitForAuth();

function waitForAuth(){
    if(user != "loggedOut"){
        displayImages();
    }
    else{
        setTimeout(function(){
            waitForAuth();
        },250);
    }
}

function displayImages(){
    var i = 0;
    userPicRef.on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot){
            var pics = childSnapshot.val().src;
            for(var x = 0; x < pics.length; x++){
                zip.file("pic" + i +".jpg", pics[x], {base64: true});
                console.log(pics[x]);
                $(".imgs-row").append(
                    '<li>'+
                        '<a href="data:image/jpg;base64,' + pics[x] +'">'+
                            '<img src="data:image/jpg;base64,'+ pics[x] +'" alt="" title="" />'+
                        '</a>'+
                    '</li>'
                );
                i++;
            }
        });
    });
    $(".img-download").show();
}

function downloadImages(){
    var content = zip.generate({type:"blob"});
    saveAs(content, "iStitchPics.zip");
}
