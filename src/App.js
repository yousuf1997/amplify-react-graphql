import './App.css';
import { createNote, deleteNote } from './graphql/mutations'
import { listNotes } from './graphql/queries'
import { withAuthenticator, Button, Text, Flex, Heading,
  Image,
  TextField,
  View } from "@aws-amplify/ui-react";
import { useCallback, useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Storage } from 'aws-amplify';

function App({ signOut }) {
  const client = generateClient();
  const [notes, setNotes] = useState([])

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const url = await Storage.get(note.name);
          note.image = url;
        }
        return note;
      })
    );
    setNotes(notesFromAPI);
  }

  const handleCreateNote = useCallback(async () => {
    await client.graphql({
      query: createNote,
      variables: { input: { text: window.prompt("New note") } },
      authMode: 'AMAZON_COGNITO_USER_POOLS'
    })
    fetchNotes()
  }, [fetchNotes])

  const handleDeleteNote = useCallback(async (id) => {
    await client.graphql({
      query: deleteNote,
      variables: { input: { id: id } },
      authMode: 'AMAZON_COGNITO_USER_POOLS'
    })
    fetchNotes()
  }, [fetchNotes])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  return (
    <Flex direction={"column"}>
      <Flex justifyContent={'space-between'}>
        <Heading level={1}>My notes</Heading>
        <Button onClick={signOut}>Sign Out</Button>
      </Flex>
      {notes.map(note => <Flex alignItems={'center'}>
        <Text>{note.text}</Text>
        <Button onClick={() => handleDeleteNote(note.id)}>Remove</Button>
      </Flex>)}
      <Button onClick={handleCreateNote}>Add Note</Button>
    </Flex>
  );
}

export default withAuthenticator(App);