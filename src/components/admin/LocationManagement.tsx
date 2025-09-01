
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus, ChevronRight, ChevronDown, Edit, Trash2, ToggleLeft, ToggleRight, MoreVertical } from "lucide-react";
import { locationService, Location } from "@/services/locationService";
import { LocationFormModal } from "./LocationFormModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LocationManagement = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());
  const [regionChildren, setRegionChildren] = useState<Record<string, Location[]>>({});
  const [cityChildren, setCityChildren] = useState<Record<string, Location[]>>({});
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const allLocations = await locationService.getAllLocations();
      
      // Separate regions from other locations
      const regions = allLocations.filter(loc => loc.type === 'region');
      const cities = allLocations.filter(loc => loc.type === 'city');
      const towns = allLocations.filter(loc => loc.type === 'town');
      
      setLocations(regions);
      
      // Group cities by region
      const regionCitiesMap: Record<string, Location[]> = {};
      cities.forEach(city => {
        if (city.parent_id) {
          if (!regionCitiesMap[city.parent_id]) {
            regionCitiesMap[city.parent_id] = [];
          }
          regionCitiesMap[city.parent_id].push(city);
        }
      });
      setRegionChildren(regionCitiesMap);
      
      // Group towns by city
      const cityTownsMap: Record<string, Location[]> = {};
      towns.forEach(town => {
        if (town.parent_id) {
          if (!cityTownsMap[town.parent_id]) {
            cityTownsMap[town.parent_id] = [];
          }
          cityTownsMap[town.parent_id].push(town);
        }
      });
      setCityChildren(cityTownsMap);
      
    } catch (error) {
      console.error('Error loading locations:', error);
      toast({
        title: "Error",
        description: "Failed to load locations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRegion = (regionId: string) => {
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(regionId)) {
      newExpanded.delete(regionId);
    } else {
      newExpanded.add(regionId);
    }
    setExpandedRegions(newExpanded);
  };

  const toggleCity = (cityId: string) => {
    const newExpanded = new Set(expandedCities);
    if (newExpanded.has(cityId)) {
      newExpanded.delete(cityId);
    } else {
      newExpanded.add(cityId);
    }
    setExpandedCities(newExpanded);
  };

  const handleAddLocation = (parentId?: string, type?: 'region' | 'city' | 'town') => {
    setEditingLocation(null);
    setIsFormOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setIsFormOpen(true);
  };

  const handleDeleteLocation = async (location: Location) => {
    if (!confirm(`Are you sure you want to delete "${location.name}"? This will also delete all child locations.`)) {
      return;
    }

    try {
      await locationService.deleteLocation(location.id);
      toast({
        title: "Success",
        description: `${location.name} has been deleted successfully.`
      });
      await loadLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (location: Location) => {
    try {
      await locationService.toggleLocationActive(location.id, !location.active);
      toast({
        title: "Success",
        description: `${location.name} has been ${!location.active ? 'activated' : 'deactivated'}.`
      });
      await loadLocations();
    } catch (error) {
      console.error('Error toggling location status:', error);
      toast({
        title: "Error",
        description: "Failed to update location status",
        variant: "destructive"
      });
    }
  };

  const handleFormSubmit = async () => {
    setIsFormOpen(false);
    await loadLocations();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Location Management</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage regions, cities, and towns hierarchically
              </p>
            </div>
            <Button onClick={() => handleAddLocation()} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Region
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {locations.map((region) => (
              <div key={region.id} className="border rounded-lg">
                {/* Region Header - Mobile Optimized */}
                <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRegion(region.id)}
                      className="p-2 h-10 w-10 flex-shrink-0"
                    >
                      {expandedRegions.has(region.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium truncate">{region.name}</span>
                        <Badge variant="outline" className="text-xs">Region</Badge>
                        {!region.active && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                      </div>
                      <div className="text-sm text-gray-500">
                        {regionChildren[region.id]?.length || 0} cities
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Actions - Dropdown Menu */}
                  <div className="hidden sm:flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddLocation(region.id, 'city')}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add City
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(region)}
                    >
                      {region.active ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditLocation(region)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLocation(region)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Mobile Actions - Dropdown Menu */}
                  <div className="sm:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleAddLocation(region.id, 'city')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add City
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(region)}>
                          {region.active ? (
                            <ToggleLeft className="h-4 w-4 mr-2" />
                          ) : (
                            <ToggleRight className="h-4 w-4 mr-2" />
                          )}
                          {region.active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditLocation(region)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteLocation(region)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {/* Cities - Mobile Optimized */}
                {expandedRegions.has(region.id) && regionChildren[region.id] && (
                  <div className="border-t bg-gray-50">
                    {regionChildren[region.id].map((city) => (
                      <div key={city.id} className="ml-4 sm:ml-8 border-b last:border-b-0">
                        <div className="flex items-center justify-between p-3 hover:bg-gray-100">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCity(city.id)}
                              className="p-2 h-8 w-8 flex-shrink-0"
                            >
                              {expandedCities.has(city.id) ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </Button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm truncate">{city.name}</span>
                                <Badge variant="secondary" className="text-xs">City</Badge>
                                {!city.active && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                              </div>
                              <div className="text-xs text-gray-500">
                                {cityChildren[city.id]?.length || 0} towns
                              </div>
                            </div>
                          </div>
                          
                          {/* Mobile Actions - Dropdown Menu */}
                          <div className="hidden sm:flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddLocation(city.id, 'town')}
                              className="text-xs px-2 py-1"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Town
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(city)}
                              className="p-1"
                            >
                              {city.active ? (
                                <ToggleRight className="h-3 w-3 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-3 w-3 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLocation(city)}
                              className="p-1"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLocation(city)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {/* Mobile Actions - Dropdown Menu */}
                          <div className="sm:hidden">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleAddLocation(city.id, 'town')}>
                                  <Plus className="h-3 w-3 mr-2" />
                                  Add Town
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActive(city)}>
                                  {city.active ? (
                                    <ToggleLeft className="h-3 w-3 mr-2" />
                                  ) : (
                                    <ToggleRight className="h-3 w-3 mr-2" />
                                  )}
                                  {city.active ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditLocation(city)}>
                                  <Edit className="h-3 w-3 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteLocation(city)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        {/* Towns - Mobile Optimized */}
                        {expandedCities.has(city.id) && cityChildren[city.id] && (
                          <div className="ml-4 sm:ml-8 bg-gray-100">
                            {cityChildren[city.id].map((town) => (
                              <div key={town.id} className="flex items-center justify-between p-2 border-b last:border-b-0 hover:bg-gray-200">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                  <span className="text-sm truncate">{town.name}</span>
                                  <Badge variant="outline" className="text-xs">Town</Badge>
                                  {!town.active && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                                </div>
                                
                                {/* Mobile Actions - Dropdown Menu */}
                                <div className="hidden sm:flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleActive(town)}
                                    className="p-1"
                                  >
                                    {town.active ? (
                                      <ToggleRight className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <ToggleLeft className="h-3 w-3 text-gray-400" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditLocation(town)}
                                    className="p-1"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteLocation(town)}
                                    className="text-red-600 hover:text-red-700 p-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                {/* Mobile Actions - Dropdown Menu */}
                                <div className="sm:hidden">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                      <DropdownMenuItem onClick={() => handleToggleActive(town)}>
                                        {town.active ? (
                                          <ToggleLeft className="h-3 w-3 mr-2" />
                                        ) : (
                                          <ToggleRight className="h-3 w-3 mr-2" />
                                        )}
                                        {town.active ? 'Deactivate' : 'Activate'}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleEditLocation(town)}>
                                        <Edit className="h-3 w-3 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleDeleteLocation(town)}
                                        className="text-red-600 focus:text-red-600"
                                      >
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <LocationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingLocation={editingLocation}
      />
    </div>
  );
};

export default LocationManagement;
