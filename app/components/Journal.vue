<template>
  <Page actionBarHidden="true">
      <TabView id="journalTabView" :selectedIndex="journalTabIndex" @selectedIndexChange="journalTabIndexChanged" 
      class="journalTabView" iosIconRenderingMode="alwaysOriginal" 
      androidOffscreenTabLimit="1" androidTabsPosition="bottom">
          <TabViewItem class="journalTabViewItem" title="Locations">
              <StackLayout>
                  <GridLayout columns="20, *, 50, 50, 55" rows="auto" class="locationList" style="margin-top: 3">
                      <StackLayout row="0" col="0" class="vc hc">
                          <Image src="~/images/penrose.png" width="70%" height="70%"></Image>
                      </StackLayout>
                      <StackLayout row="0" col="1" >
                          <Label text="Location"/>
                      </StackLayout>
                      <StackLayout row="0" col="2" class="hc">
                          <Label text="Power" class="tc"/>
                      </StackLayout>
                      <StackLayout row="0" col="3" class="hc">
                          <Label text="Radius"/>
                      </StackLayout>
                      <StackLayout row="0" col="5" class="hc">
                          <Label text="Distance"/>
                      </StackLayout>
                  </GridLayout>
                  
                  <RadListView id="pointListView" for="location in fatumLocationsList">
                      <v-template>
                          <GridLayout columns="20, *, 63, 55, 55" rows="auto" class="locationList">
                              <FlexboxLayout row="0" col="0" @tap="onFatumLocationSelect(location)" class="vc hc">
                              <Image src="~/images/attractor-marker.png" width="80%" height="80%" style="align: center" v-if="location.type=='Attractor'"></Image>
                              <Image src="~/images/void-marker.png" width="80%" height="80%" v-else-if="location.type=='Void'"></Image>
                              </FlexboxLayout>
                              <StackLayout row="0" col="1" @tap="onFatumLocationSelect(location)" style="margin: 2">
                              <Label :text="location.type + ' (' + location.usertag + ')'" v-if="location.usertag" :color="colorCompute(location.hiddenMarker)" />
                              <Label :text="location.type" v-else=""  :color="colorCompute(location.hiddenMarker)"/>
                              </StackLayout>
                              <StackLayout row="0" col="2" @tap="onFatumLocationSelect(location)">
                              <Label :text="location.strength" v-if="location.strength>0" :color="colorCompute(location.hiddenMarker)" class="tc"/>
                              </StackLayout>
                              <StackLayout row="0" col="3" @tap="onFatumLocationSelect(location)">
                              <Label :text="location.radius + 'm'" v-if="location.radius>0" :color="colorCompute(location.hiddenMarker)" class="tc"/>
                              </StackLayout>
                              <StackLayout row="0" col="5" @tap="onFatumLocationSelect(location)">
                              <!--<Label :text="'Distance ' + getLocationDistanceFromUser(location)"/>-->
                              <Label :text="location.distance + 'm'" :color="colorCompute(location.hiddenMarker)" class="tc"/>
                              </StackLayout>
                          </GridLayout>
                      </v-template>
                  </RadListView>
              </StackLayout>
          </TabViewItem>

          <TabViewItem title="Journeys">
              <StackLayout>
              <Label class="fs" textWrap="true" text="Journeys... Deus ex Deixats? (Despair or Dopamine?)" color="#000080"/>
              <Label text="Found artifacts...Deixedrine anyone?" color="#000080"/>
              <Label textWrap="true" text="Created constructs... I should put all these journal items into one tab in a chat like interface with attachments..."   color="#000080"/>
              </StackLayout>
          </TabViewItem>
      </TabView>
  </Page>
</template>
