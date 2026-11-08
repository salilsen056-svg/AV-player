import React,{useEffect,useMemo,useRef,useState} from 'react';
import {View,Pressable,Text} from 'react-native';
import {VideoView,useVideoPlayer} from 'expo-video';
// Keep playback on Android Media3/ExoPlayer by default. LibVLC is opt-in.
export default function AndroidSurface(props){
 const wasPlaying=useRef(false),view=useRef(null),[fullscreen,setFullscreen]=useState(false);
 const callbacks=useRef(props);callbacks.current=props;
 const source=useMemo(()=>({uri:props.source.uri,...(/\.m3u8(?:[?#]|$)/i.test(props.source.uri)?{contentType:'hls'}:{})}),[props.source.uri]);
 const player=useVideoPlayer(source,p=>{p.timeUpdateEventInterval=.25});
 const report=e=>callbacks.current.onError?.({message:e?.message||String(e)});
 useEffect(()=>{
  const ready=()=>callbacks.current.onLoad?.({duration:player.duration*1000});
  const subscriptions=[
   player.addListener('statusChange',event=>{if(event.status==='error')report(event.error||Error('Unable to open this source.'));else if(event.status==='readyToPlay')ready();else if(event.status==='loading')callbacks.current.onBuffering?.({bufferRate:0})}),
   player.addListener('playingChange',event=>{const before=wasPlaying.current;wasPlaying.current=event.isPlaying;if(event.isPlaying)callbacks.current.onPlaying?.();else if(before&&player.status==='readyToPlay')callbacks.current.onPaused?.()}),
   player.addListener('timeUpdate',event=>{const duration=player.duration;callbacks.current.onProgress?.({currentTime:event.currentTime*1000,duration:duration*1000,position:duration>0?event.currentTime/duration:0})}),
   player.addListener('playToEnd',()=>callbacks.current.onEnded?.())
  ];
  if(player.status==='readyToPlay')ready();else if(player.status==='error')report(Error('Media could not be opened.'));
  return()=>subscriptions.forEach(s=>s.remove());
 },[player]);
 useEffect(()=>{try{props.paused?player.pause():player.play()}catch(e){report(e)}},[player,props.paused]);
 useEffect(()=>{try{player.volume=Math.max(0,Math.min(1,props.volume/100))}catch(e){report(e)}},[player,props.volume]);
 useEffect(()=>{try{player.playbackRate=props.rate}catch(e){report(e)}},[player,props.rate]);
 useEffect(()=>{if(props.seek!==undefined&&player.duration>0)try{player.currentTime=Math.max(0,Math.min(player.duration,props.seek*player.duration))}catch(e){report(e)}},[player,props.seek]);
 async function enterFullscreen(){try{await view.current?.enterFullscreen()}catch(e){report(e)}}
 return <View><VideoView ref={view} player={player} style={props.style} nativeControls={fullscreen} contentFit="contain" surfaceType="textureView" fullscreenOptions={{enable:!props.audio,orientation:'landscape',autoExitOnRotate:false}} onFullscreenEnter={()=>setFullscreen(true)} onFullscreenExit={()=>setFullscreen(false)}/>{!props.audio&&<Pressable accessibilityRole="button" accessibilityLabel="Enter fullscreen" onPress={enterFullscreen} style={{alignSelf:'flex-end',marginTop:10,paddingVertical:11,paddingHorizontal:16,borderRadius:6,backgroundColor:'#2b3922'}}><Text style={{color:'#f5bc87',fontSize:13}}>⛶ Fullscreen</Text></Pressable>}</View>;
}
