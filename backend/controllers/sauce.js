const Sauce = require('../models/Sauce');
// utilisation de File System de NodeJS
const fs = require('fs');

// Afficher toutes les sauces
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
  .then((sauce) => {res.status(200).json(sauce)})
  .catch((error) => {res.status(400).json({ error })});
};

// Afficher une sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
  .then((sauce) => {res.status(200).json(sauce)})
  .catch((error) => {res.status(404).json({ error })});
};

// Créer une sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0
  });
  sauce.save()
  .then(() => {res.status(201).json({message: 'La sauce a été créée.'})})
  .catch((error) => {res.status(400).json({ error })});
};

// Modifier une sauce
exports.modifySauce = (req, res, next) => {
  if (req.file) {
    // Si modification de l'image, suppression de l'ancienne image dans le dossier /images
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          // Mise à jour suite à suppression de l'image
          const sauceObject = {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
          }
          Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'La sauce a été modifiée.' }))
            .catch(error => res.status(400).json({ error }));
        })
      })
      .catch(error => res.status(500).json({ error }));
    } 
    else 
    {
      // si absence de modification d'image
      const sauceObject = { ...req.body };
      Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'La sauce a été modifiée.' }))
        .catch(error => res.status(400).json({ error }));
    }
};

// Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'La sauce a été supprimée.'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

// Like et dislike d'une sauce
exports.likeSauce = (req, res, next) => {
  const userId = req.body.userId;
  const like = req.body.like;
  const sauceId = req.params.id;
  Sauce.findOne({ _id: sauceId })
    .then(sauce => {
      // nouvelles valeurs à modifier
      const newValues = {
        usersLiked: sauce.usersLiked,
        usersDisliked: sauce.usersDisliked,
        likes: 0,
        dislikes: 0
      }
      // Trois cas:
      switch (like) {
        case 1:  // Sauce liked
          newValues.usersLiked.push(userId);
          break;
        case -1:  // Sauce disliked
          newValues.usersDisliked.push(userId);
          break;
        case 0:  // Annulation du like/dislike
          if (newValues.usersLiked.includes(userId)) {
            // Annulation du like
            const index = newValues.usersLiked.indexOf(userId);
            newValues.usersLiked.splice(index, 1);
          } else {
            // Annulation du dislike
            const index = newValues.usersDisliked.indexOf(userId);
            newValues.usersDisliked.splice(index, 1);
          }
          break;
      };
      // Calcul du nombre de likes / dislikes
      newValues.likes = newValues.usersLiked.length;
      newValues.dislikes = newValues.usersDisliked.length;
      // Mise à jour de la sauce
      Sauce.updateOne({ _id: sauceId }, newValues )
        .then(() => res.status(200).json({ message: 'La sauce a été notée.' }))
        .catch(error => res.status(400).json({ error }))  
  })
  .catch(error => res.status(500).json({ error }));
}