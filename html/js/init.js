var g_world;
var lastUpdateTime = new Date();
var updateThreshold = 15;
var frame=0;
var g_show_fps = false;
var lastTime = new Date();

var g_painter = null;
var g_imgcache = null;

function loop() {
  var d = new Date();
  var update = false;
  var dt = d.getTime() - lastUpdateTime.getTime();

  if (dt > updateThreshold) {
    lastUpdateTime = d;
    update = true;
  }

  //frame = frame + 1;
  frame++;
  if ( frame >= 30 ) {
    msec = (d.getTime() - lastTime ) / frame;
    lastTime = d;
    frame = 0;
  }

  if (g_show_fps) {
    console.log("fps:", 1000.0/msec);
  }

  requestAnimationFrame(loop, 1);

  if (update) {
    g_world.update();
  }

  g_painter.dirty_flag = true;
  if (g_painter.dirty_flag) {
    g_world.draw();
  }

}


if ( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = ( function() {
      return window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function( callback, element ) {
        window.setTimeout( callback, 1000 );
      };
    } )();
}

$(document).ready( function() {
  console.log("ready...");

  g_world = new mainWorld();
  g_painter = new bleepsixRender("canvas");

  init();
  requestAnimationFrame(loop, 1);
});

function delayed_init() {
  if (g_imgcache.image["base_sprite"].ready) {
    g_world.fill();
  } else {
    setTimeout(delayed_init, 100);
  }
}

function init() {

  setTimeout(delayed_init, 100);

  console.log("init");

  g_imgcache = new imageCache();
  g_imgcache.add("base_sprite", "assets/base_sprite.png");

  $('#x1').on('click', function() { console.log("x1"); g_world.scale = 1; });
  $('#x2').on('click', function() { console.log("x2"); g_world.scale = 2; });
  $('#x4').on('click', function() { console.log("x4"); g_world.scale = 4; });
  $('#x8').on('click', function() { console.log("x8"); g_world.scale = 8; });
  $('#x16').on('click', function() { console.log("x16"); g_world.scale = 16; });

  var g_playpause = "pause";

  $('#play-pause').on('click',
    function() {
      var z = document.getElementById("play-pause");

      if (g_playpause=="play") {
        z.innerHTML = '<span class="glyphicon glyphicon-stop" aria-hidden="true"></span>';
        g_playpause="pause"
      } else {
        z.innerHTML = '<span class="glyphicon glyphicon-play" aria-hidden="true"></span>';
        g_playpause="play";
      }
      console.log("play-pause");
    }
  );

  $("#delay-input").on("change", function() {
    var s_val = document.getElementById("delay-input").value;
    var val = 100;
    if (val = parseInt(s_val)) {
      if (isNaN(val)) { val=100; }
      if (val <= 0) { val = 100; }
    } else { val = 100; }
    g_world.setDelay(val);
  });

  $('#all-checkbox').on('click', function() { console.log("all-checkbox...", document.getElementById("all-checkbox").checked); });

  $('#idle-checkbox').on('click', function() { g_world.animLoop("idle", document.getElementById("idle-checkbox").checked); });
  $('#walk-checkbox').on('click', function() { g_world.animLoop("walk", document.getElementById("walk-checkbox").checked); });
  $('#jump-checkbox').on('click', function() { console.log("jump-checkbox...", document.getElementById("jump-checkbox").checked); });
  $('#attack-checkbox').on('click', function() { console.log("attack-checkbox...", document.getElementById("attack-checkbox").checked); });
  $('#bow-checkbox').on('click', function() { console.log("bow-checkbox...", document.getElementById("bow-checkbox").checked); });

  var parts = [ "tunic", "boot", "pant", "arm", "skin", "hair", "weapon" ];
  var npart = [       3,      1,      2,     1,      3,      1,        5 ];

  for (var i=0; i<parts.length; i++) {
    for (var j=0; j<npart[i]; j++) {

      var ele_name = "#" + parts[i] + "-color-" + j;
      var it_name = parts[i] + "_" + j;

      var rgba = g_world.color_map[ g_world.ele_map[it_name] ];

      var r = rgba[0];
      var g = rgba[1];
      var b = rgba[2];

      var hex_rgb = rgbToHex(r,g,b);

      $(ele_name).spectrum({
        showInput:true,
        allowEmpty:true,
        //color:"#f00",
        color: hex_rgb,
        change: (function(__ele_name,__it_name) { return function(c) {
          color_change(__ele_name, c);

          var rgb = c.toRgb();

          var src_color = g_world.ele_map[__it_name];
          g_world.color_map[src_color] =
             new Uint8ClampedArray([ Math.floor(rgb.r),
                                     Math.floor(rgb.g),
                                     Math.floor(rgb.b), 255 ]);
          g_world.fill();
          };
        })(ele_name, it_name)
      });


    }
  }


  $("#background-color").spectrum({
    showInput:true,
    allowEmpty:true,
    color:"hsva(0,0%,0%,0)",
    showAlpha:true,
    //change: function(c) { console.log("background", ">>>", c.toHexString(), c.getAlpha()); }


      change: (function(__ele_name,__it_name) { return function(c) {
        color_change(__ele_name, c);

        var rgb = c.toRgb();

        var src_color = g_world.ele_map[__it_name];
        g_world.color_map[src_color] =
           new Uint8ClampedArray([ Math.floor(rgb.r),
                                   Math.floor(rgb.g),
                                   Math.floor(rgb.b), 255 ]);
        g_world.fill();
        };
      })("background", "background")
  });

  $("#reset_color").on("click", function() {
    g_world.reset_color_map();

    for (var ele in g_world.ele_map) {
      var src_color = g_world.ele_map[ele];
      var dst_color = g_world.color_map[src_color];

      ele_parts = ele.split("_");
      var c = tinycolor({r:dst_color[0], g:dst_color[1], b:dst_color[2]});

      $("#" + ele_parts[0] + "-color-" + ele_parts[1]).spectrum("set", c.toHexString());
    }
    g_world.fill();

  });

  $("#random_color").on("click", function() {
    g_world.random_color_map();

    for (var ele in g_world.ele_map) {
      var src_color = g_world.ele_map[ele];
      var dst_color = g_world.color_map[src_color];

      ele_parts = ele.split("_");
      var c = tinycolor({r:dst_color[0], g:dst_color[1], b:dst_color[2]});

      $("#" + ele_parts[0] + "-color-" + ele_parts[1]).spectrum("set", c.toHexString());
    }
    g_world.fill();

  });

  /*
  $('#tunic-color-1').spectrum({
    color:"#f00",
    change: function(c) { console.log("tunic-0 >>>", c.toHexString()); }
  });

  $('#tunic-color-2').spectrum({
    color:"#f00",
    change: function(c) { console.log("tunic-0 >>>", c.toHexString()); }
  });
  */

}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


function color_change(ele_name, color) {
  console.log(">>>", ele_name, color.toHexString());
}