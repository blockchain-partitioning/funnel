const Utensil = require('./utensil/utensil');
const funnels = [require('./funnels/regular'),require( './funnels/filtered/hostname')];

funnels.forEach(funnel => {
    if(funnel.hasFilter(Utensil.filterType())){
        funnel.conduct();
    }
});