# MMM-MirrorMirrorOnTheWall

This is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror). 



You have to setup and install [Alexa Skill]() before using this module.


## Dependencies

Install via `npm install`

- [aws-sdk]() 
- ["watson-developer-cloud"]()
- ["chart.js]()


## Configuration

The entry in config.js can look like the following. (NOTE: You only have to add the variables to config if want to change its standard value.)

```Javascript
{
    module: 'MMM-MirrorMirrorOnTheWall',
    position: "middle_center",
    config: {}
}
```


## Usage

If you have setup the [complementary Alexa skill](https://github.com/joanaz/MirrorMirrorOnTheWallSkill) as instructed in its readme, you should be able to invoke it by saying `"Mirror Mirror On The Wall"`. Next you can say any of the following commands to trigger different actions on the Magic Mirror.


