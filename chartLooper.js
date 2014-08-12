//Controllable GIF imitation thing
//Nick Kasprak

window.jQueryChartLoopers = {};

jQueryChartLoopers.init = function(onComplete) {

	jQueryChartLoopers.timers = {};
	
	jQueryChartLoopers.jQueryChartLooper = function(ops) {
		try {
			this.looperName = ops.looperName;
			var looperName = this.looperName;
			this.locationRoot = ops.locationRoot;
			this.defaultChangeTime = ops.defaultChangeTime;
			this.fadeLength = ops.fadeLength;
			this.playing = ops.playOnStart;
			arrayOfFileNames = ops.arrayOfFileNames;
			this.images = [];
			this.customTimings = [];
			this.customFadeLengths = [];
			this.animating = false;
			this.embedLink = false;
			if (ops.embedLink) {
				this.embedLink = ops.embedLink;	
			}
			for (var fileIndex = 0;fileIndex < arrayOfFileNames.length; fileIndex++) {
				if (typeof(arrayOfFileNames[fileIndex]) == "string") {
					this.images.push(this.locationRoot + "/" + arrayOfFileNames[fileIndex]);
				} else {
					this.images.push(this.locationRoot + "/" + arrayOfFileNames[fileIndex][0]);
					this.customTimings[fileIndex] = arrayOfFileNames[fileIndex][1];
					if (typeof(arrayOfFileNames[fileIndex][2]) != "undefined") {
						this.customFadeLengths[fileIndex] = arrayOfFileNames[fileIndex][2];
					}
				}
			}
			this.divID = ops.divID;
			var divID = ops.divID;
			width = ops.width;
			height = ops.height;
			$("#" + divID).addClass("jQueryChartLooper");
			var subDiv = $("<div class='jQueryChartLooperSubDiv' id='"+divID + "_subDiv'>");
			this.currentFrame = ops.startFrame;
			var startFrame = ops.startFrame;
			this.previousFrame = null;
			var parent = $("#" + divID);
			$(parent).append(subDiv);
			$("#" + divID +"_subDiv").height(height);
			$("#" + divID +"_subDiv").width(width);
			var frameID;
			this.framesLoaded = [];
			for (var fileIndex = 0;fileIndex<this.images.length;fileIndex++) {
				frameID = divID + '_loop_frame_' + fileIndex;
				subDiv.append($('<div class="loop_frame" style="display:none;z-index:' + ((fileIndex == 0) ? '10' : '0') + '" id="' + frameID + '"></div>'));
				this.framesLoaded[fileIndex] = false;
			}
			
			var buttonDiv = $('<div style="text-align:center;width:'+width+'px"></div>');
			var leftButton = $('<img id="' + looperName + '_leftButton" src="rewind_light.png" class="buttons">')
			$(leftButton).click(jQueryChartLoopers.leftButton);
			var pauseButton = $('<img id="' + looperName + '_pauseButton" src="' + (this.playing ? "pause":"play") + '_light.png" class="buttons">')
			$(pauseButton).click(jQueryChartLoopers.pauseButton);
			var rightButton = $('<img id="' + looperName + '_rightButton" src="foward_light.png" class="buttons">')
			$(rightButton).click(jQueryChartLoopers.rightButton);
			var fbButton = $('<a target = "_blank" href="https://www.facebook.com/sharer/sharer.php?u=' + document.URL + '" target="_blank"><img class="buttons" src="facebook_light.png" /></a>');
			var twitButton = $('<a target = "_blank" href="https://twitter.com/share?text=' + encodeURIComponent(document.title) + '" target="_blank"><img class="buttons" src="twitter_light.png" /></a>');
			$(buttonDiv).append(leftButton, pauseButton, rightButton, fbButton, twitButton);
			if (this.embedLink == true) {
				var embedButton = $('<img id="' + looperName + '_embedButton" class="buttons" src="embed_light.png" />');
				var embedDiv = $("<div id='" + looperName + "_embedDiv' class='chartLooperEmbedShare'><p>To feature this image on your site, use this embed code:</p> <p class='code'>" + jQueryChartLoopers.htmlEncode('<iframe src="' + document.URL + '" style="height:' + (height + 64) + 'px;width:' + (width+64) + 'px;border:0px" frameborder="0"></iframe>') + "</p><p align='center'><button id='" + looperName + "_embedOK'>OK</button></p></div>");
				$(subDiv).append(embedDiv);
				
				$("#" + looperName + "_embedOK").click(function() {
					var looperID = this.id.substr(0, this.id.length - 8);
					$("#" + looperID + "_embedDiv").fadeOut(100);
				});
				
				$(embedButton).click(jQueryChartLoopers.embedButton);
				$(buttonDiv).append(embedButton);
			}
			
			$(parent).append(buttonDiv);
			$(".jQueryChartLooper .buttons").hover(function() {
				this.src = this.src.replace("light","dark");
			}, function() {
				this.src = this.src.replace("dark","light");
			});
			frameID = divID + "_loop_frame_" + startFrame;
			$("#" + frameID).show();
			if (!this.playing) {
				$("#" + divID).fadeTo(0,.3);
				var bigPlayButton = $("<img class='bigPlayButton' src='play.png' id='" + looperName + "_bigPlay' />");
				$(bigPlayButton).css("left",(width - 178)/2);
				$(bigPlayButton).css("top", (height-178)/2);
				$(bigPlayButton).css("cursor","pointer");
				$(bigPlayButton).click(function() {
					var looperID = this.id.substr(0, this.id.length - 8);
					jQueryChartLoopers[looperID].playing=true;
					jQueryChartLoopers[looperID].drawNewFrame();
					$("#" + looperID + '_pauseButton').attr("src", "pause_light.png");
					$("#" + jQueryChartLoopers[looperID].divID).fadeTo(0,1);
					$(this).remove();
				});
				$("#" + divID + "_subDiv").append(bigPlayButton);
				
			}
			this.advance = function() {
				this.previousFrame = this.currentFrame;
				this.currentFrame++;	
				if (this.currentFrame >= this.images.length) this.currentFrame = 0;
			}
			this.goback = function() {
				this.previousFrame = this.currentFrame;
				this.currentFrame--;	
				if (this.currentFrame < 0) this.currentFrame = this.images.length - 1;
			}
			this.isAnimated = function() {
				for (var index=0;index<this.images.length;index++) {
					if ($("#" + this.divID + "_loop_frame_" + index).is(":animated")) {
						return true;
					}
				}
				return false;
			}
			
			this.drawNewFrame = function(advance) {
				try {
					if (typeof(advance) == "undefined") advance = true;
					if (advance == true) {
						this.advance();
					}
					$("#" + this.divID + "_loop_frame_" + this.currentFrame).css({"z-index":0});
					function loadFrame(looperObject,frame) {
						if (looperObject.framesLoaded[frame] == false) {
							$("#" + looperObject.divID + "_loop_frame_" + frame).append($('<img id="' + looperObject.frameID + '_img" src="' + looperObject.images[frame] + '"/>'));
							looperObject.framesLoaded[frame] = true;	
						}
					}
					loadFrame(this,this.currentFrame);
					if (this.currentFrame < this.framesLoaded.length - 1) {
						loadFrame(this,this.currentFrame+1);	
					}
					
					var defaultChangeTime = this.defaultChangeTime;
					if (this.customTimings[this.currentFrame]) defaultChangeTime = this.customTimings[this.currentFrame]; 
					var fadeLength = this.fadeLength;
					if (this.playing == true) {
						if (this.customFadeLengths[this.currentFrame]) {
							fadeLength = this.customFadeLengths[this.currentFrame];
						}
					}
					
					if (this.previousFrame != null) {
						$("#" + this.divID + "_loop_frame_" + this.previousFrame).css({"z-index":10});
						$("#" + this.divID + "_loop_frame_" + this.previousFrame).fadeOut(fadeLength);
					}
						
					$("#" + this.divID + "_loop_frame_" + this.currentFrame).show();
					
					var looper = this;
					if (this.playing == true) {
						jQueryChartLoopers.timers[this.looperName] = setTimeout(looper.drawNewFrame.bind(looper),defaultChangeTime);
					}
					
				} catch (ex) {
					console.log(ex);	
				}
			}
		} catch (ex) {
			console.log(ex);	
		}
	}
	
	jQueryChartLoopers.leftButton = function() {
		
		var looperID = this.id.substr(0, this.id.length - 11);
		if ($("#" + looperID + "_bigPlay").length > 0) {
			$("#" + looperID + "_bigPlay").click();	
		}
		jQueryChartLoopers[looperID].playing = false;
		clearTimeout(jQueryChartLoopers.timers[looperID]);
		document.getElementById(looperID + "_pauseButton").src = "play_light.png";
		
		
		if (jQueryChartLoopers[looperID].isAnimated()) {
			
		} else {
			jQueryChartLoopers[looperID].goback();
			jQueryChartLoopers[looperID].drawNewFrame(false);
		}
		
	}
	jQueryChartLoopers.pauseButton = function() {
		var looperID = this.id.substr(0, this.id.length - 12);
		if ($("#" + looperID + "_bigPlay").length > 0) {
			$("#" + looperID + "_bigPlay").click();	
		} else {
			if (jQueryChartLoopers[looperID].playing == true) {
				this.src = "play_dark.png";
				jQueryChartLoopers[looperID].playing = false;
				clearTimeout(jQueryChartLoopers.timers[looperID]);
			} else {
				this.src = "pause_dark.png";
				jQueryChartLoopers[looperID].playing = true;
				jQueryChartLoopers[looperID].drawNewFrame();
			}
		}
		
		
	}
	jQueryChartLoopers.rightButton = function() {
		var looperID = this.id.substr(0, this.id.length - 12);
		if ($("#" + looperID + "_bigPlay").length > 0) {
			$("#" + looperID + "_bigPlay").click();	
		}
		jQueryChartLoopers[looperID].playing = false;
		document.getElementById(looperID + "_pauseButton").src = "play_light.png";
		clearTimeout(jQueryChartLoopers.timers[looperID]);
		if (jQueryChartLoopers[looperID].isAnimated()) {
			
		} else {
			
			jQueryChartLoopers[looperID].drawNewFrame();
		}
	}
	
	jQueryChartLoopers.embedButton = function() {
		var looperID = this.id.substr(0, this.id.length - 12);
		if ($("#" + looperID + "_bigPlay").length > 0) {
			$("#" + looperID + "_bigPlay").click();	
		}
		$("#" + looperID + "_embedDiv").fadeIn(100);
	}
	
	
	jQueryChartLoopers.htmlEncode = function(value) {
		
		 return $('<div/>').text(value).html();
	}
	
	onComplete();

}