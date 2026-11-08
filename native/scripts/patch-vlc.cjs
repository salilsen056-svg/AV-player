// Local file URIs must use LibVLC's location constructor, not its filesystem-path constructor.
const fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'../node_modules/react-native-vlc-media-player/android/src/main/java/com/yuanzhou/vlc/vlcplayer/ReactVlcPlayerView.java');
let source=fs.readFileSync(file,'utf8');
const original=`            if (isNetwork) {
                Uri uri = Uri.parse(uriString);
                m = new Media(libvlc, uri);
            } else {
                m = new Media(libvlc, uriString);
            }`;
const replacement=`            // AV Player: file:// and content:// are locations, not filesystem paths.
            Uri mediaUri = Uri.parse(uriString);
            if (mediaUri.getScheme() != null) {
                m = new Media(libvlc, mediaUri);
            } else {
                m = new Media(libvlc, uriString);
            }`;
if(source.includes(original))source=source.replace(original,replacement);
else if(!source.includes(replacement))throw Error('VLC source changed: review local URI patch before building.');
const catchOriginal=`            e.printStackTrace();
            //Toast.makeText(getContext(), "Error creating player!", Toast.LENGTH_LONG).show();`;
const catchReplacement=`            e.printStackTrace();
            WritableMap error = Arguments.createMap();
            error.putString("type", "Error");
            error.putString("message", e.getMessage() == null ? "Unable to open media" : e.getMessage());
            eventEmitter.sendEvent(error, VideoEventEmitter.EVENT_ON_ERROR);`;
if(source.includes(catchOriginal))source=source.replace(catchOriginal,catchReplacement);
else if(!source.includes(catchReplacement))throw Error('VLC source changed: review error forwarding patch.');
fs.writeFileSync(file,source);console.log('Applied AV Player local URI and playback error fixes.');
