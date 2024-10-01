
const pen_animation = {
	animationRun(timeNow)
	{
		this.timeFrameCurrent = timeNow;
		this.animateFrame(this.args);
		this.timeFrameLast = timeNow;
		this.animationID = requestAnimationFrame(this.animationRun);
	},

	animationStart(timeNow)
	{
		if(this.timeAnimationInit < 0){
			this.timeAnimationInit = timeNow;
		}
		this.timeAnimationStart = timeNow;
		this.timeFrameCurrent = timeNow;
		this.timeFrameLast = timeNow;
		this.animationID = requestAnimationFrame(this.animationRun);
	},

	initAnimationComponent(animationComponent, animationFunction, animationArguments = false, animationShouldStart = true)
	{	
		animationComponent.args = animationArguments;
		
		animationComponent.timeAnimationInit = -1;
		animationComponent.timeAnimationStart = -1;
		animationComponent.timeFrameLast = -1;
		animationComponent.timeFrameCurrent = -1;
		
		animationComponent.animationID = 0;
		
		animationComponent.animationStart = animation_animationStart.bind(animationComponent);
		animationComponent.animationRun = animation_animationRun.bind(animationComponent);
		animationComponent.animateFrame = animationFunction.bind(animationComponent);
		
		if(animationShouldStart){
			animationComponent.animationID = requestAnimationFrame(animationComponent.animationStart);
		}
	},
};
