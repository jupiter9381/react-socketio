import React, {Component} from 'react';
import Sound from 'react-sound';
class SoundBox extends Component{
    constructor(props){
        super(props);        
    }
    shouldComponentUpdate(nextProps, nextState){
       
        if(this.props.url == nextProps.url && this.props.check == nextProps.check){
            
            return false;
        }
        console.info('soundbox', 'willupdate');
        return true;
    }
    render(){
        return (
            <div>
                <Sound
                    url = {this.props.url}
                    playStatus={this.props.playStatus}
                    playFromPosition={this.props.playFromPosition /* in milliseconds */}
                    volume={this.props.volume}
                    onFinishedPlaying={this.props.onFinishedPlaying}
                />
            </div>
        )
    }
}
export default SoundBox;