import React,{useEffect,useMemo,useRef} from 'react';
import {VideoView,useVideoPlayer} from 'expo-video';
// Keep playback on Android Media3/ExoPlayer by default. LibVLC is opt-in.
export default function AndroidSurface(props){
 const callbacks=useRef(props);callbacks.current=props;
 const source=useMemo(()=>({uri:props.source.uri,...(/\.m3u8(?:[?#]|$)/i.test(props.source.uri)?{contentType:'hls'}:{})}),[props.source.uri]);
 const player=useVideoPlayer(source,p=>{p.timeUpdateEventInterval=.25});
 const report=e=>callbacks.current.onError?.({message:e?.message||String(e)});
 useEffect(()=>{
  const ready=()=>callbacks.current.onLoad?.({duration:player.duration*1000});
  const subscriptions=[
   player.addListener('statusChange',event=>{if(event.status==='error')report(event.error||Error('Unable to open this source.'));else if(event.status==='readyToPlay')ready();else if(event.status==='loading')callbacks.current.onBuffering?.({bufferRate:0})}),
   player.addListener('playingChange',event=>{if(event.isPlaying)callbacks.current.onPlaying?.()}),
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
 return <VideoView player={player} style={props.style} nativeControls={false} contentFit="contain" surfaceType="textureView"/>;
}
