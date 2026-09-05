---
title: "Reconstruire l'univers, épisode 1 : pourquoi une simulation N-corps ?"
description: "Premier article d'une série où je pars de zéro en physique pour comprendre, étape par étape, tout ce qu'il faut savoir entre l'avant Big Bang et l'apparition de la vie — en partant d'un projet concret : une simulation N-corps en C."
pubDate: "2026-09-05"
badge: "Série"
tags: ["physique", "big_bang", "C", "cosmologie", "vulgarisation"]
---

Il y a quelques jours, j'ai fini un petit projet en C : **big_bang**, une simulation
N-corps (norme 42, MiniLibX). Le principe est simple à décrire et amusant à
regarder : quelques centaines de particules démarrent au même point avec une
vitesse initiale aléatoire — une mini-expansion — puis la gravité newtonienne
s'exerce entre chaque paire de particules, à chaque frame. Sans rien faire
d'autre, l'expansion finit par être rattrapée par l'attraction gravitationnelle :
des amas et des filaments de matière se forment tout seuls, sous mes yeux, dans
une fenêtre MiniLibX.

![Simulation big_bang après ~90s : noyau lié entouré d'un halo de particules échappées](/big_bang_screenshot.png)

Le code tient dans une poignée de fichiers C très courts (`physics.c` fait une
quarantaine de lignes). Et pourtant, en l'écrivant, je me suis rendu compte
d'un truc : je peux faire tourner un modèle de formation des structures
cosmiques sans en comprendre la moitié. Je sais coder `F = G·m₁·m₂/d²`. Je ne
sais pas pourquoi il y a eu un Big Bang, ni pourquoi cette même gravité qui
forme des amas de particules dans ma simulation a aussi, dans le vrai
univers, fini par produire des étoiles, des planètes, et — au bout d'une
chaîne de hasards extraordinairement longue — moi en train d'écrire ce billet.

## Le projet de cette série

Je n'y connaissais rien en physique. Alors avec Claude, on a construit un
plan de lecture en 13 étapes, de l'étape 0 (avant même le Big Bang) jusqu'à
l'apparition des premiers êtres vivants — le trajet complet entre "rien" et
"quelqu'un capable de lire ce blog". Chaque étape s'appuie sur une ressource
librement accessible en ligne.

Cette série documente ce parcours, article par article. Pas pour prétendre
devenir physicien en quelques semaines — mais pour construire une
compréhension honnête, étape logique par étape logique, de ce que représente
vraiment ma petite simulation en C par rapport au vrai univers.

## Étape 0 — Avant le Big Bang

Avant de parler de "Big Bang" au sens où on l'entend d'habitude, il faut
distinguer deux choses qu'on confond souvent :

- Le modèle standard de la cosmologie décrit l'**expansion** de l'univers
  depuis un état dense et chaud — il ne dit rien sur un instant "zéro"
  précis ni sur une "cause".
- La théorie de l'**inflation cosmique** propose qu'entre 10⁻⁴³ et 10⁻³⁵
  seconde après cet état initial, l'univers a connu une expansion
  extraordinairement rapide, qui explique entre autres pourquoi l'univers
  observable est aussi homogène et plat qu'il l'est.

Autrement dit : ma simulation démarre toutes ses particules *au même point*,
un peu comme une caricature de cet état initial dense. Mais elle ne modélise
absolument pas l'inflation — elle commence bien après, au moment où la
gravité newtonienne classique redevient une bonne approximation.

**Pour aller plus loin :** [Inflation cosmique — Wikipédia](https://fr.wikipedia.org/wiki/Inflation_cosmique)

## Étape 1 — La mécanique classique, fondation du code

Tout ce que fait `physics.c` repose sur trois idées de mécanique newtonienne :

1. Une force attire chaque paire de particules, proportionnelle au produit de
   leurs masses et inversement proportionnelle au carré de la distance.
2. Cette force produit une accélération (`F = m·a`), qu'on intègre à chaque
   frame pour mettre à jour la vitesse, puis la position.
3. Un facteur d'adoucissement (`SOFTENING`) évite que deux particules trop
   proches ne produisent une force infinie — un artefact numérique, pas un
   phénomène physique.

C'est exactement la mécanique que Newton a formalisée au XVIIe siècle, et
qui reste, encore aujourd'hui, une excellente approximation pour tout ce qui
n'est ni extrêmement rapide (relativité restreinte) ni extrêmement massif à
courte distance (relativité générale).

**Pour aller plus loin :** [Mécanique de Newton — cours EPFL (gratuit en audit sur Coursera)](https://www.classcentral.com/course/mecanique-newton-4428)

## La suite

Le prochain article couvrira les étapes 2 et 3 : le problème à N corps (pourquoi
trois masses en interaction suffisent déjà à rendre le mouvement chaotique) et
la thermodynamique — comment décrire statistiquement le comportement de
centaines de particules sans suivre chacune individuellement.

Le code de `big_bang` est disponible sur mon
[Forgejo auto-hébergé](https://git.vnaoussi-djoumessi.com/viery/big_bang).
