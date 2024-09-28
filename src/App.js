import { useRef, useState,useEffect } from "react";
import sortPlacesByDistance from "./location";
import Places from "./components/Places";
import { AVAILABLE_PLACES } from "./data";
import Modal from "./components/Modal";
import DeleteConfirmation from "./components/DeleteConfirmation";
import logoImg from "./assets/adventureLogo-m.png";

const storedIds= JSON.parse(localStorage.getItem('selectedPlace'))||[];
const storedPlaces= (storedIds.map((id)=>AVAILABLE_PLACES.find((place)=>place.id===id)));

function App() {
  const [AvailablePlaces, setAvailablePlaces] = useState([]);
  const modal = useRef();
  const selectedPlace = useRef();
  const [pickedPlaces, setPickedPlaces] = useState(storedPlaces);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const sortedPlaces = sortPlacesByDistance(
        AVAILABLE_PLACES,
        position.coords.latitude,
        position.coords.longitude
      );
      setAvailablePlaces(sortedPlaces);
    });
  }, []);
  
  
  function handleStartRemovePlace(id) {
    modal.current.open();
    selectedPlace.current = id;
  }
  
  function handleStopRemovePlace() {
    modal.current.close();
  }
  
  function handleSelectPlace(id) {
    setPickedPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === id)) {
        return prevPickedPlaces;
      }
      const place = AVAILABLE_PLACES.find((place) => place.id === id);
      return [place, ...prevPickedPlaces];
    });
    const storedIds= JSON.parse(localStorage.getItem('selectedPlace'))||[];
    if(storedIds.indexOf(id)===-1){
      localStorage.setItem("selectedPlace", JSON.stringify([id,...storedIds]));
    }
  }
  

  function handleRemovePlace(id) {
    setPickedPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
    );
    modal.current.close();
    const storedIds= JSON.parse(localStorage.getItem('selectedPlace'))||[];
    localStorage.setItem("selectedPlace", JSON.stringify(storedIds.filter((id)=>id!==selectedPlace.current)));
    
  }

  return (
    <>
      <Modal ref={modal} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText={"Select the places you would like to visit below."}
          places={pickedPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <Places
          title="Available Places"
          places={AvailablePlaces}
          onSelectPlace={handleSelectPlace}
        />
      </main>
    </>
  );
}

export default App;

