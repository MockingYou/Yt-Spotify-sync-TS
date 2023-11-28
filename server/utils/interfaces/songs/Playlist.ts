import Song from './Song'

export default interface Playlist {
    id: string,
    title: string,
    songNames: Array<Song>,
}
