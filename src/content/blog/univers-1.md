---
title: "Un univers qui tient dans un nombre, épisode 1 : Comment j'ai volé un kron à mon univers"
description: "Premier article d'une série où je pars de zéro pour créer tout un univers. Stocker un univers est impossible, alors je ne le stocke pas : je le recalcule. Retour sur la première couche d'un monde numérique."
pubDate: "2026-09-06"
badge: "Série"
tags: ["octree", "causalité", "monde numérique", "nombre pseudo-aléatoires"]
---

Je construis un monde numérique. Un endroit qui obéirait à une physique cohérente, mais où les lois seraient les miennes, et où l'on pourrait voir lesquelles tiennent et lesquelles s'effondrent.
 
Le projet est découpé en couches. Tout en bas, il y a le vide : l'espace, le temps, et la règle qui les relie. Tout en haut, il y aurait des entités, des sociétés, des institutions. Chaque couche naît de celle du dessous et ne peut jamais écrire dedans. C'est cette contrainte qui rend l'ensemble intéressant : une loi qui ne fonctionne pas ne fonctionne pas *contre quelque chose*, et l'échec devient un fait mesurable plutôt qu'une opinion.
 
Je viens de terminer la couche du bas. Il n'y a rien dedans — c'est précisément le but. Et ça m'a pris bien plus longtemps que prévu, à cause de deux bugs dont je vais parler en détail, parce qu'ils m'ont appris davantage que tout le reste.

## Le problème que je ne voulais pas avoir

Le premier réflexe, quand on veut construire un univers, c'est de vouloir le fabriquer. On imagine des galaxies posées quelque part, des planètes stockées dans une base de données, des coordonnées enregistrées.
 
Ça ne marche pas. Pas « c'est difficile » : ça ne marche pas. Notre univers observable contient de l'ordre de deux mille milliards de galaxies. Rien qu'écrire leur position occuperait plus de mémoire que l'humanité n'en a jamais fabriquée. Et je ne parle que des galaxies, pas des étoiles qu'elles contiennent, ni des planètes, ni de quoi que ce soit de plus fin.
 
Il fallait donc renverser le problème. Et le renversement tient en une phrase : **le monde n'est pas stocké, il est recalculé**.
 
L'image la plus juste est celle de la recette et du gâteau. Un gâteau prend de la place, il faut un four et une boîte. Une recette tient sur une carte postale. Et surtout, la même recette redonne toujours le même gâteau. Si je peux garantir cette dernière propriété — la même recette, toujours le même résultat — alors je n'ai plus besoin de conserver le gâteau.
 
C'est exactement ce que fait la couche du bas. Elle ne contient pas un monde. Elle contient de quoi le refaire, à l'identique, autant de fois qu'on veut.

## La graine

tout part d'un seul nombre. On l'appelle la graine.
 
Vous donnez un nom à votre monde, disons `terra1`. Ce nom devient un nombre. Ce nombre, c'est votre univers entier. Changez une seule lettre du nom et vous obtenez un univers complètement différent, sans le moindre rapport avec le précédent, pas une variante, pas un cousin : un autre monde.
 
L'idée n'est pas neuve, tous les jeux à génération procédurale l'utilisent. Ce qui l'est davantage, c'est la rigueur qu'elle exige. Pour que la promesse tienne, il faut que le calcul soit **absolument** reproductible. Le même nombre, sur ma machine et sur la vôtre, dans un an, doit redonner exactement la même chose. Pas « à peu près la même chose ». Exactement.
 
Cette exigence a une conséquence directe sur la façon d'écrire le code, et j'y reviendrai en parlant du premier bug. Elle interdit notamment d'utiliser les nombres à virgule dans les calculs de fond ; ils ne se comportent pas rigoureusement pareil d'une machine à l'autre. Tout se fait en nombres entiers, et la virgule n'apparaît qu'au tout dernier moment, pour la valeur qu'on montre.

## D'un nombre à des milliards : l'abre

Un seul nombre ne peut évidemment pas décrire un univers. Il faut le démultiplier.
 
La méthode est celle de la ramification. Le nombre du monde donne les nombres des grandes régions. Chaque région donne les nombres de ses sous-régions. Et ainsi de suite, aussi loin qu'on veut descendre. Un arbre, dont chaque branche tire son numéro de celui de la branche du dessus.
 
Un détail décide de tout ici, et il m'a fallu y réfléchir un moment. Il existe deux façons de produire des nombres : en suite, ou par adresse.
 
Un générateur de hasard classique produit une **suite**. Il donne un premier nombre, puis un deuxième, puis un troisième. Pour connaître le millionième, il faut avoir tiré les 999 999 précédents. C'est parfait pour lancer des dés, et totalement inutilisable ici : je veux pouvoir demander « qu'y a-t-il à cet endroit précis ? » sans avoir calculé tout ce qui vient avant.
 
Il fallait donc un système par **adresse**. On donne un chemin (région 12, sous-région 3, élément 8) et on obtient directement le nombre correspondant, en trois opérations, sans aucun ordre imposé et sans mémoire de ce qui a été calculé avant.
 
C'est ce qui rend l'ensemble utilisable. Deux personnes explorant deux coins opposés du monde obtiennent des résultats parfaitement cohérents sans jamais se parler, sans serveur central, sans se synchroniser. Chacun calcule ce qu'il regarde, personne ne calcule le reste.

## Sous le capot : deux fonctions qui font le contraire l'une de l'autre


Il faut d'abord transformer un mot en nombre. L'arbre est parcouru avec des étiquettes lisibles (« région », « taille », « octant ») mais une machine ne calcule qu'avec des chiffres. Et il ne suffit pas de convertir : il faut **mélanger** le mot au numéro du parent, sinon deux branches d'un même nœud donneraient le même résultat.

La fonction qui s'en charge, je l'appelle *absorber*, Voici ce qu'elle fait, en pseudo-code :

```
absorber(numéro_du_parent, mot) :
    h ← numéro_du_parent, combiné à une constante de départ
    pour chaque lettre du mot :
        h ← h combiné avec cette lettre
        h ← h × 1099511628211
    rendre h
```

C'est tout. Une boucle, une combinaison, une multiplication.
 
Le rôle de cette multiplication mérite qu'on s'y arrête, parce qu'elle est le cœur du procédé. Multiplier par un très grand nombre impair fait « déborder » le résultat vers la gauche : l'influence de la lettre qu'on vient d'absorber s'étale sur l'ensemble des chiffres du nombre. À la fin de la boucle, chaque lettre du mot a laissé sa trace partout, et pas seulement à un endroit.
 
Ce procédé n'est pas de moi. Il s'appelle **FNV**, du nom de ses auteurs Glenn Fowler, Landon Curt Noll et Phong Vo, et il est né d'une remarque envoyée à un comité de normalisation en 1991[^fnv]. J'utilise sa variante FNV-1a, qui combine la lettre avant de multiplier plutôt que l'inverse. Je l'ai choisie pour deux raisons très prosaïques : elle tient en quatre lignes, et elle ne dépend d'aucune bibliothèque. Dans un projet dont toute la promesse repose sur « le même calcul partout », chaque dépendance extérieure est un risque de divergence.
 
Trois conséquences utiles en découlent.
 
**L'ordre des lettres compte.** « taille » et « aille t » donnent des résultats sans aucun rapport, puisque chaque lettre est absorbée à un moment différent de la boucle.
 
**Le parent compte.** Le même mot « taille » appliqué à deux objets différents donne deux nombres différents, puisqu'on ne part pas du même point.
 
**Le contexte compte.** C'est le détail le plus subtil, et je l'ai ajouté après coup. Avant même les lettres du mot, j'absorbe un marqueur : une lettre C quand je fabrique une branche, une lettre V quand je lis une valeur. Sans lui, « descendre vers la branche *taille* » et « lire la propriété *taille* » calculeraient exactement la même chose. Le numéro d'une branche entière serait identique à la valeur d'une propriété. Rien ne planterait,  c'est bien le problème. Des objets censés être indépendants se retrouveraient discrètement corrélés, et il aurait fallu des mois pour s'apercevoir que quelque chose cloche.

### La seconde disperse
 
À la sortie d'*absorber*, le compte n'y est pourtant pas. Deux entrées voisines produisent encore des nombres voisins, et FNV a une faiblesse connue et parfaitement documentée : ses chiffres de poids faible sont mal brassés. Le dernier d'entre eux, notamment, se calcule directement à partir des lettres d'entrée ; on peut le prédire sans faire tourner la fonction[^lowbits]. Si je m'arrêtais là, deux régions adjacentes de mon monde auraient des propriétés visiblement liées. On verrait apparaître des rayures, des motifs réguliers, des répétitions. Le monde aurait l'air fabriqué, parce qu'il le serait, mal.
 
D'où la seconde fonction, *mélanger*, dont le travail est de casser toute ressemblance :
 
```
mélanger(x) :
    x ← x + GRANDE_CONSTANTE_1
    x ← x combiné avec (x décalé de 30 chiffres vers la droite)
    x ← x × GRANDE_CONSTANTE_2
    x ← x combiné avec (x décalé de 27 chiffres vers la droite)
    x ← x × GRANDE_CONSTANTE_3
    x ← x combiné avec (x décalé de 31 chiffres vers la droite)
    rendre x
```
 
Six lignes, trois types d'opérations qui alternent.
 
L'**addition** décale l'ensemble du nombre. La **multiplication** propage l'information vers la gauche, comme dans *absorber*. Et le **décalage combiné** fait l'inverse : il projette les chiffres de poids fort sur ceux de poids faible. C'est cette troisième opération qui manquait ; sans elle, l'information ne circule que dans un sens et les bits de tête restent isolés.
 
En alternant les deux dernières trois fois, on atteint l'objectif recherché : **changer un seul chiffre binaire en entrée modifie environ la moitié des chiffres en sortie**, et lesquels est imprévisible. C'est ce qu'on appelle l'effet d'avalanche, et c'est mesurable. Un de mes tests prend vingt mille paires de nombres consécutifs, compare leurs résultats, et compte les différences. Il trouve 31,99 chiffres modifiés sur 64. L'idéal théorique est 32.
 
Là encore, rien n'est de moi. Cette fonction est le *finaliseur* de **SplitMix64**, publié en 2014 par Guy Steele, Doug Lea et Christine Flood[^splitmix], et repris depuis dans d'innombrables bibliothèques. J'ai simplement recopié six lignes éprouvées plutôt que d'inventer les miennes — c'est exactement le genre de brique qu'il ne faut pas chercher à réécrire soi-même.
 
Une note sur la première constante, parce qu'elle a une histoire. Elle vaut 11 400 714 819 323 198 485, et ce n'est pas un nombre arbitraire : c'est la plus grande valeur représentable sur 64 chiffres binaires, divisée par le nombre d'or. Cette proportion a la propriété remarquable d'être la plus « mal approchée » de toutes par des fractions simples ; ce qui, ici, est une qualité : elle évite les cycles et les régularités. Le nombre d'or, cette fois, ne sert pas à dessiner de jolies spirales mais à empêcher un univers de se répéter.
 
Deux propriétés de cette fonction valent la peine d'être signalées.
 
**Elle est réversible.** Chaque opération peut être défaite : la multiplication par un nombre impair s'inverse, le décalage combiné aussi. Elle ne perd donc aucune information. Conséquence directe et précieuse : deux entrées différentes ne peuvent jamais donner la même sortie. Aucune collision n'est possible, jamais. Là où beaucoup de systèmes doivent gérer le cas où deux objets tombent par malchance sur le même identifiant, je peux simplement l'ignorer.
 
**Ce n'est pas de la cryptographie.** *Mélanger* est rapide et statistiquement excellente, mais quelqu'un de déterminé pourrait remonter d'une valeur jusqu'à la graine dont elle est issue. Pour un monde solo, aucune importance. Le jour où plusieurs personnes partageraient le même univers et où deviner la graine d'un voisin poserait un problème, il faudrait passer à une véritable fonction cryptographique : beaucoup plus lente, mais ce serait le seul endroit du code à modifier. C'est le genre de porte qu'on aime laisser ouverte.

### Le trajet complet
 
Mises bout à bout, voici ce que coûte une propriété quelconque, n'importe où dans l'univers :
 
```
monde  = mélanger(absorber(0, "world-v1"))
région = mélanger(absorber(monde, "octant 3"))
taille = mélanger(absorber(région, "taille"))
```
 
Trois lignes. Une poignée d'additions, de multiplications et de décalages — des opérations qu'un processeur exécute en une fraction de milliardième de seconde.
 
C'est de là que vient la sensation d'immédiateté. Il n'y a rien à chercher, rien à charger, rien à attendre. On ne consulte pas l'univers : on le **déduit**, à chaque regard, à partir de rien.
 
## Le détail qui économise des mois de travail
 
Voici le point le plus technique de cet article, mais il vaut l'effort, parce que c'est celui qui décide si le projet survivra à ses six premiers mois.
 
Quand on demande une propriété à un objet (sa taille, son âge, sa densité) il faut préciser laquelle. Pas seulement dire « donne-moi un nombre » : dire « donne-moi le nombre correspondant à *la taille* ». Le nom de la propriété fait partie du calcul.
 
Ça paraît anodin. C'est vital.
 
Imaginez le contraire. Un objet a une taille et un âge, tirés l'un après l'autre dans une même suite. Six mois plus tard, vous ajoutez une propriété : la densité, insérée entre les deux. À cet instant précis, **tous les âges de l'univers changent**. Chaque objet déjà exploré devient différent. Chaque monde sauvegardé est invalidé. Tout le travail accompli repose sur du sable.
 
Avec un nom par propriété, ce scénario disparaît. La taille sort d'une porte, l'âge d'une autre, la densité d'une troisième. Vous pouvez en ajouter cent, dans n'importe quel ordre, quand vous voulez : rien de ce qui existait ne bouge.
 
C'est le genre de décision qui ne se voit pas, qui ne rend le programme ni plus beau ni plus rapide, et qui détermine pourtant si l'on pourra continuer à travailler dessus dans deux ans.

## Où suis-je ? L'espace comme des boîtes gigognes
 
Vient ensuite la question de l'endroit. Comment nommer un lieu dans un espace infini ?
 
La réponse est jolie, et elle m'a demandé plusieurs jours pour arriver à quelque chose d'aussi simple.
 
Prenez tout l'espace : un cube. Coupez-le en deux dans chaque direction : vous obtenez huit sous-cubes. Choisissez celui où vous êtes. Recommencez avec ce sous-cube : huit nouveaux, choisissez encore. Et ainsi de suite.
 
Une position, c'est donc une suite de choix : « le sous-cube n° 3, puis le n° 7, puis le n° 0… ». Plus la suite est longue, plus le lieu désigné est précis. Une suite courte désigne une immense région, une suite longue désigne un point.
 
Ce que j'ai mis du temps à voir, c'est que cette suite de choix **n'est pas autre chose que la position elle-même**, simplement lue autrement. Les coordonnées sont des nombres ; ces nombres sont faits de chiffres binaires ; et chaque chiffre, du plus significatif au moins significatif, correspond exactement à un choix de sous-cube. Le chemin *est* la coordonnée. Il n'y a rien à convertir, rien à inventer, rien à stocker.
 
Ce qui garantit du même coup la propriété que je cherchais : la correspondance est parfaite dans les deux sens. D'une position on tire un chemin, du chemin on retrouve la position exacte. Sans perte, sans approximation. Je l'ai vérifié sur deux millions de points tirés au hasard dans tout l'espace.
 
Cadeau supplémentaire, et il comptera beaucoup plus tard : deux lieux voisins partagent le début de leur chemin. Deux points séparés d'un pas partagent 63 choix sur 64. C'est ce qui permettra de calculer une région une fois et de réutiliser le travail pour tout ce qu'elle contient.

## Le piège du zéro
 
Un détail m'a coûté une soirée. Les coordonnées négatives cassent tout.
 
Dans la façon dont les machines représentent les nombres, un nombre négatif commence par un chiffre binaire différent de celui d'un nombre positif. Résultat : l'ordre des chiffres ne suit plus l'ordre des positions, et le découpage en cubes se déchire précisément autour de l'origine. Deux points voisins de part et d'autre du zéro se retrouvent aux deux extrémités opposées de l'arbre.
 
La solution est simple une fois qu'on l'a vue : ne pas mettre l'origine à l'origine. On décale tout, pour que le point zéro tombe exactement au **milieu** du cube plutôt qu'à un bord. Le découpage redevient parfaitement régulier, et le problème n'existe plus.

## Le kron et le dral
 
À ce stade, j'avais un espace et un temps, mesurés en unités. Restait à les nommer, et j'ai refusé « seconde » et « mètre ».
 
La raison est de fond. Ces mots transportent des attentes. Dire « une seconde », c'est importer sans y penser tout un rapport au temps venu de notre monde. Dire « un mètre », c'est décider par avance de l'échelle de tout le reste. Or je n'en sais rien encore, et je n'ai pas besoin de le savoir.
 
Alors ces deux unités ont reçu leurs propres noms.
 
Le **kron** est le pas de temps : la plus petite durée que le monde sache distinguer. En dessous, rien n'existe. Le compteur du monde avance de kron en kron.
 
Le **dral** est le pas d'espace : le plus petit écart de position représentable. Le « pixel » du monde.
 
Et surtout, je n'ai pas dit ce qu'ils valent. Un kron n'est ni une seconde ni un million d'années. Un dral n'est ni un millimètre ni une année-lumière. L'échelle réelle est rangée à part, dans une valeur purement descriptive qu'on peut changer à tout moment sans qu'un seul calcul en soit affecté. Je pourrai construire plusieurs couches entières en ne raisonnant qu'en pas, et ne trancher qu'au moment où ça deviendra vraiment nécessaire.

## Le nombre qui dessine une carte politique
 
Vient alors la pièce que j'avais complètement oubliée, et qui est probablement la plus importante de toute la couche.
 
Mon espace et mon temps s'ignoraient. Un dral était un dral, un kron était un kron, et rien ne disait combien de drals on peut franchir pendant un kron. Sans ce chiffre, tout événement est instantané partout. Et un monde où tout se sait immédiatement est un monde **sans géographie** : la distance n'y coûte rien, donc elle n'existe pas.
 
Il fallait un plafond. Un seul nombre : combien de drals au maximum par kron.
 
Chez nous ce chiffre s'appelle la vitesse de la lumière, mais il ne s'agit pas de lumière ni de photons. Il s'agit d'un plafond de propagation : la vitesse maximale à laquelle une nouvelle, une influence, une conséquence peut voyager.
 
Voici ce que ça produit. Prenez deux endroits séparés de mille drals, dans un monde plafonné à dix drals par kron. Une information met cent krons pour faire le trajet, deux cents pour un aller-retour. Une loi qui exigerait une autorisation centrale devient inapplicable à cette distance : le temps que la réponse revienne, la situation a changé trois fois. Les habitants inventeront des délégués, des coutumes locales, de l'autonomie régionale. Non pas parce que je l'aurai programmé, mais parce que la géométrie ne leur laisse pas le choix.
 
Baissez le plafond : le monde se fragmente en villages étrangers les uns aux autres. Montez-le très haut : un pouvoir unique peut gouverner l'univers entier en temps réel.
 
**Je ne décide pas quelles sociétés existent. Je décide ce qui est physiquement possible, et les sociétés s'y adaptent.** C'est exactement la séparation que je cherchais entre ce qui est hérité et ce qui est imposé.
 
Et il y a un bénéfice caché, purement technique celui-là. Si rien ne va plus vite que ce plafond, une région lointaine ne peut pas influencer celle que je suis en train de regarder. Je n'ai donc jamais besoin de simuler l'univers entier. La contrainte qui rend le monde intéressant est aussi celle qui le rend calculable.
 
J'ai donc rangé ce nombre avec la graine, dans ce qui définit un monde. Un univers, chez moi, tient désormais en trois valeurs : la graine, la version des règles, le plafond. Deux mondes issus du même code, avec la même graine mais des plafonds opposés, ont une géographie rigoureusement identique et deux avenirs politiques contraires. C'est le levier principal du projet, et il tient en un entier.

## Deux bugs
 
Rien de ce qui précède ne m'a autant appris que les deux erreurs suivantes. Toutes deux ont été trouvées par des tests automatiques, aucune par relecture. Je les raconte parce qu'elles disent quelque chose de général.
 
### Le décalage impossible
 
Le premier est une faute de programmation classique, mais dévastatrice dans ce contexte précis.
 
Une fonction devait calculer la taille d'un cube en fonction de sa profondeur dans l'arbre. À la profondeur zéro, celle du cube tout entier, le calcul demandait un décalage de 64 chiffres binaires sur un nombre qui en contient 64.
 
En langage C, cette opération est officiellement *non définie*[^shift]. Ce qui ne veut pas dire « interdite » : ça veut dire que le langage ne promet rien du tout. Le compilateur ne dit rien. Le programme fonctionne. Il rend une valeur. Simplement, cette valeur peut différer d'une machine à l'autre, d'un compilateur à l'autre, ou même selon le niveau d'optimisation.
 
Dans n'importe quel programme, c'est un défaut. Dans un monde qui repose intégralement sur le fait de se recalculer à l'identique partout, c'est mortel : deux personnes pourraient explorer deux univers différents en croyant partager le même.
 
Ce qui m'a sauvé, ce n'est pas une relecture attentive. C'est un test qui vérifiait bêtement que les tailles de cubes étaient correctes, à toutes les profondeurs, y compris zéro.
 
### Le kron volé
 
Le second est plus subtil, et c'est mon préféré, parce que le bug n'était pas dans le code mais dans une définition.
 
Pour savoir combien de krons une nouvelle met à traverser une distance, on divise la distance par le plafond. Et pour cela, il faut d'abord connaître la distance, qui, entre deux points quelconques, tombe presque toujours entre deux nombres entiers.
 
J'arrondissais vers le bas. Une distance réelle de 10,5 drals était annoncée comme 10.
 
Sur un trajet unique, l'erreur est invisible : un demi-dral perdu. Mais découpez le voyage en étapes. À chaque étape, l'information gagne un peu de terrain gratuitement. Les fractions s'additionnent. Et au bout de quelques relais, une nouvelle a voyagé plus vite que le plafond censé la limiter.
 
Autrement dit : la vitesse maximale de mon univers devenait **négociable**, simplement en découpant le trajet. Toute la causalité pouvait être contournée par un procédé trivial : cette garantie que je voulais offrir aux couches supérieures, celle sur laquelle reposent le délai de l'information et donc la géographie politique.
 
La correction tient en un mot : arrondir vers le haut. Mais le vrai enseignement est ailleurs. Ce bug n'était pas une faute de frappe ni une étourderie. C'était une **incohérence entre deux définitions** que j'avais posées à deux moments différents, chacune raisonnable isolément. Le test qui l'a trouvé ne vérifiait pas un calcul : il vérifiait que deux notions différentes de la distance racontaient bien la même histoire.
 
C'est là que se cachent les vrais problèmes d'un projet comme celui-ci. Pas dans les lignes de code, mais dans les endroits où deux idées justes ne se rejoignent pas tout à fait.
 
## Ce que j'ai retiré
 
Une dernière décision mérite d'être racontée, parce qu'elle a été prise en marche arrière.
 
J'avais commencé par poser les constantes physiques de notre univers : la vitesse de la lumière, la gravitation, quelques autres. Par réflexe. Et par un argument qui me paraissait solide : en gardant nos constantes, toute la science mesurée depuis un siècle devenait une bibliothèque gratuite.
 
Puis j'ai regardé le code et j'ai constaté que **pas une seule ligne ne les utilisait**. C'était de la décoration.
 
Et plus profondément, elles contredisaient le projet. Je n'écris pas une réplique de notre monde, j'en écris une réécriture. Poser d'emblée nos constantes, c'était fixer par avance des comportements que je veux justement pouvoir choisir.
 
Elles ont donc disparu. La règle qui les remplace est plus simple et plus juste : **une constante appartient à la couche qui s'en sert**. Celles qui gouverneront la matière naîtront avec la matière. Celles qui gouverneront le vivant naîtront avec le vivant. Rien ne remonte en bas par principe.
 
Le prix est réel et je l'assume : je perds la bibliothèque gratuite. Chaque comportement devra être défini à la main, à chaque couche. Plus de liberté, plus de travail. Pour une réécriture, c'est le bon échange.
 
## Ce qu'il y a maintenant : rien
 
La couche du bas est terminée. Vingt-trois tests, tous au vert, dont plusieurs tournent sur des millions de cas tirés au hasard.
 
Et elle est parfaitement vide.
 
Elle sait dire un endroit, un instant, et si deux événements peuvent être reliés. Elle ne sait pas ce qu'est la matière, ni l'énergie, ni la gravité. Elle ne contient pas un seul objet. Un monde entier y tient en trois valeurs et quelques dizaines d'octets.
 
C'est exactement ce qu'il fallait. Un cadre qui ne décide de rien, sur lequel tout le reste pourra reposer sans jamais pouvoir le contredire.
 
La suite consistera à le remplir : décider ce que la graine fait apparaître dans ce vide, et selon quelles règles. C'est là que mon refus des constantes toutes faites va commencer à se payer, dans les deux sens du terme.
 
Mais ça, c'est le prochain article.
 
---
 
## Références
 
[^fnv]: Landon Curt Noll, *FNV Hash*. La page de référence des auteurs, avec les constantes officielles et l'historique complet : <http://www.isthe.com/chongo/tech/comp/fnv/>
 
[^lowbits]: Sur la faiblesse des chiffres de poids faible de FNV-1a et les cas où il vaut mieux s'en passer : <https://stelfox.net/notes/algorithms/fnv-1a-hash/>
 
[^splitmix]: Guy L. Steele, Doug Lea, Christine H. Flood, *Fast splittable pseudorandom number generators*, OOPSLA 2014 : <https://doi.org/10.1145/2714064.2660195>. Implémentation de référence en C par Sebastiano Vigna : <https://prng.di.unimi.it/splitmix64.c>
 
[^shift]: SEI CERT C Coding Standard, règle INT34-C, *Do not shift an expression by a negative number of bits or by greater than or equal to the number of bits that exist in the operand* : <https://wiki.sei.cmu.edu/confluence/display/c/INT34-C.+Do+not+shift+an+expression+by+a+negative+number+of+bits+or+by+greater+than+or+equal+to+the+number+of+bits+that+exist+in+the+operand>

Le code de `big_bang` est disponible sur mon
[Forgejo auto-hébergé](https://git.vnaoussi-djoumessi.com/viery/big_bang).
